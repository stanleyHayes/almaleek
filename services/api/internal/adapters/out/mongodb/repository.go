package mongodb

import (
	"context"
	"fmt"
	"os"
	"strings"
	"sync"
	"time"

	"almaleek/internal/core/domain"
	"almaleek/internal/core/ports"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Repository struct {
	mu          sync.RWMutex
	client      *mongo.Client
	database    *mongo.Database
	creators    *mongo.Collection
	platforms   *mongo.Collection
	invitations *mongo.Collection
	events      *mongo.Collection
	intakes     *mongo.Collection
	members     *mongo.Collection
	plans       *mongo.Collection
	settings    *mongo.Collection
	uri         string
	dbName      string
}

type PlatformRepository struct {
	*Repository
}

func NewRepository(args ...interface{}) *Repository {
	repo := &Repository{
		uri:    defaultMongoURI(),
		dbName: "almaleek",
	}

	for _, arg := range args {
		switch value := arg.(type) {
		case string:
			if repo.uri == defaultMongoURI() && strings.TrimSpace(value) != "" {
				repo.uri = value
			} else if strings.TrimSpace(value) != "" {
				repo.dbName = value
			}
		case *mongo.Client:
			repo.client = value
		case []string:
			if len(value) > 0 {
				repo.uri = value[0]
			}
			if len(value) > 1 {
				repo.dbName = value[1]
			}
		}
	}

	return repo
}

func defaultMongoURI() string {
	if uri := strings.TrimSpace(os.Getenv("MONGODB_URI")); uri != "" {
		return uri
	}
	return "mongodb://localhost:27017/almaleek"
}

func (r *Repository) ensureConnected(ctx context.Context) error {
	if ctx == nil {
		ctx = context.Background()
	}

	r.mu.RLock()
	if r.client != nil && r.database != nil {
		r.mu.RUnlock()
		return nil
	}
	r.mu.RUnlock()

	r.mu.Lock()
	defer r.mu.Unlock()

	if r.client != nil && r.database != nil {
		return nil
	}

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(r.uri))
	if err != nil {
		return fmt.Errorf("connect mongodb: %w", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		_ = client.Disconnect(ctx)
		return fmt.Errorf("ping mongodb: %w", err)
	}

	r.client = client
	r.database = client.Database(r.dbName)
	r.creators = r.database.Collection("creators")
	r.platforms = r.database.Collection("platforms")
	r.invitations = r.database.Collection("invitations")
	r.events = r.database.Collection("events")
	r.intakes = r.database.Collection("intakes")
	r.members = r.database.Collection("community_members")
	r.plans = r.database.Collection("membership_plans")
	r.settings = r.database.Collection("site_settings")
	return nil
}

func (r *Repository) SaveSiteSettings(ctx context.Context, settings domain.SiteSettings) error {
	if err := r.ensureConnected(ctx); err != nil {
		return err
	}
	r.mu.RLock()
	collection := r.settings
	r.mu.RUnlock()
	_, err := collection.UpdateOne(
		ctx,
		bson.M{"key": "public_site"},
		bson.M{"$set": settings, "$setOnInsert": bson.M{"key": "public_site"}},
		options.Update().SetUpsert(true),
	)
	return err
}
func (r *Repository) GetSiteSettings(ctx context.Context) (domain.SiteSettings, error) {
	if err := r.ensureConnected(ctx); err != nil {
		return domain.SiteSettings{}, err
	}
	r.mu.RLock()
	collection := r.settings
	r.mu.RUnlock()
	var settings domain.SiteSettings
	if err := collection.FindOne(ctx, bson.M{"key": "public_site"}).Decode(&settings); err != nil {
		if err == mongo.ErrNoDocuments {
			return domain.SiteSettings{}, ports.ErrNotFound
		}
		return domain.SiteSettings{}, err
	}
	return settings, nil
}

func (r *Repository) SaveMembershipPlan(ctx context.Context, plan domain.MembershipPlan) error {
	if err := r.ensureConnected(ctx); err != nil {
		return err
	}
	r.mu.RLock()
	collection := r.plans
	r.mu.RUnlock()
	_, err := collection.ReplaceOne(ctx, bson.M{"code": plan.Code}, plan, options.Replace().SetUpsert(true))
	return err
}

func (r *Repository) ListMembershipPlans(ctx context.Context) ([]domain.MembershipPlan, error) {
	if err := r.ensureConnected(ctx); err != nil {
		return nil, err
	}
	r.mu.RLock()
	collection := r.plans
	r.mu.RUnlock()
	cursor, err := collection.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "sort_order", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	items := []domain.MembershipPlan{}
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *Repository) SaveCommunityMember(ctx context.Context, member domain.CommunityMember) error {
	if err := r.ensureConnected(ctx); err != nil {
		return err
	}
	r.mu.RLock()
	collection := r.members
	r.mu.RUnlock()
	_, err := collection.ReplaceOne(ctx, bson.M{"email": member.Email}, member, options.Replace().SetUpsert(true))
	return err
}

func (r *Repository) GetCommunityMemberByEmail(ctx context.Context, email string) (domain.CommunityMember, error) {
	if err := r.ensureConnected(ctx); err != nil {
		return domain.CommunityMember{}, err
	}
	r.mu.RLock()
	collection := r.members
	r.mu.RUnlock()
	var member domain.CommunityMember
	if err := collection.FindOne(ctx, bson.M{"email": strings.ToLower(strings.TrimSpace(email))}).Decode(&member); err != nil {
		if err == mongo.ErrNoDocuments {
			return domain.CommunityMember{}, ports.ErrNotFound
		}
		return domain.CommunityMember{}, err
	}
	return member, nil
}

func (r *Repository) ListCommunityMembers(ctx context.Context) ([]domain.CommunityMember, error) {
	if err := r.ensureConnected(ctx); err != nil {
		return nil, err
	}
	r.mu.RLock()
	collection := r.members
	r.mu.RUnlock()
	cursor, err := collection.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	items := []domain.CommunityMember{}
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *Repository) SaveInvitation(ctx context.Context, invitation domain.Invitation) error {
	if err := r.ensureConnected(ctx); err != nil {
		return err
	}
	r.mu.RLock()
	collection := r.invitations
	r.mu.RUnlock()
	_, err := collection.ReplaceOne(ctx, bson.M{"id": invitation.ID}, invitation, options.Replace().SetUpsert(true))
	return err
}

func (r *Repository) GetInvitation(ctx context.Context, token string) (domain.Invitation, error) {
	if err := r.ensureConnected(ctx); err != nil {
		return domain.Invitation{}, err
	}
	r.mu.RLock()
	collection := r.invitations
	r.mu.RUnlock()
	var invitation domain.Invitation
	if err := collection.FindOne(ctx, bson.M{"token": token}).Decode(&invitation); err != nil {
		if err == mongo.ErrNoDocuments {
			return domain.Invitation{}, ports.ErrNotFound
		}
		return domain.Invitation{}, err
	}
	return invitation, nil
}

func (r *Repository) ListInvitations(ctx context.Context) ([]domain.Invitation, error) {
	if err := r.ensureConnected(ctx); err != nil {
		return nil, err
	}
	r.mu.RLock()
	collection := r.invitations
	r.mu.RUnlock()
	cursor, err := collection.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	items := []domain.Invitation{}
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *Repository) SaveEvent(ctx context.Context, event domain.Event) error {
	if err := r.ensureConnected(ctx); err != nil {
		return err
	}
	r.mu.RLock()
	collection := r.events
	r.mu.RUnlock()
	_, err := collection.ReplaceOne(ctx, bson.M{"id": event.ID}, event, options.Replace().SetUpsert(true))
	return err
}

func (r *Repository) ListEvents(ctx context.Context) ([]domain.Event, error) {
	if err := r.ensureConnected(ctx); err != nil {
		return nil, err
	}
	r.mu.RLock()
	collection := r.events
	r.mu.RUnlock()
	cursor, err := collection.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "starts_at", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	items := []domain.Event{}
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *Repository) SaveIntake(ctx context.Context, intake domain.Intake) error {
	if err := r.ensureConnected(ctx); err != nil {
		return err
	}
	r.mu.RLock()
	collection := r.intakes
	r.mu.RUnlock()
	_, err := collection.ReplaceOne(ctx, bson.M{"id": intake.ID}, intake, options.Replace().SetUpsert(true))
	return err
}

func (r *Repository) ListIntakes(ctx context.Context) ([]domain.Intake, error) {
	if err := r.ensureConnected(ctx); err != nil {
		return nil, err
	}
	r.mu.RLock()
	collection := r.intakes
	r.mu.RUnlock()
	cursor, err := collection.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	items := []domain.Intake{}
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *Repository) Save(ctx context.Context, creator domain.Creator) error {
	if ctx == nil {
		ctx = context.Background()
	}

	if err := r.ensureConnected(ctx); err != nil {
		return err
	}

	creator.Normalize()
	if err := creator.Validate(); err != nil {
		return err
	}
	if creator.ID == "" {
		creator.ID = primitive.NewObjectID().Hex()
	}
	now := time.Now().UTC()
	if creator.CreatedAt.IsZero() {
		creator.CreatedAt = now
	}
	creator.UpdatedAt = now

	r.mu.RLock()
	coll := r.creators
	r.mu.RUnlock()

	_, err := coll.ReplaceOne(ctx, bson.M{"_id": creator.ID}, creator, options.Replace().SetUpsert(true))
	return err
}

func (r *Repository) List(ctx context.Context) ([]domain.Creator, error) {
	if ctx == nil {
		ctx = context.Background()
	}

	if err := r.ensureConnected(ctx); err != nil {
		return nil, err
	}

	r.mu.RLock()
	coll := r.creators
	r.mu.RUnlock()

	cursor, err := coll.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var creators []domain.Creator
	if err := cursor.All(ctx, &creators); err != nil {
		return nil, err
	}
	return creators, nil
}

func NewPlatformRepository(args ...interface{}) *PlatformRepository {
	return &PlatformRepository{Repository: NewRepository(args...)}
}

func (r *PlatformRepository) Save(ctx context.Context, platform domain.Platform) error {
	return r.Repository.SavePlatform(ctx, platform)
}

func (r *PlatformRepository) List(ctx context.Context) ([]domain.Platform, error) {
	return r.Repository.ListPlatforms(ctx)
}

func (r *Repository) SavePlatform(ctx context.Context, platform domain.Platform) error {
	if ctx == nil {
		ctx = context.Background()
	}

	if err := r.ensureConnected(ctx); err != nil {
		return err
	}

	platform.Normalize()
	if err := platform.Validate(); err != nil {
		return err
	}
	if platform.ID == "" {
		platform.ID = primitive.NewObjectID().Hex()
	}
	now := time.Now().UTC()
	if platform.CreatedAt.IsZero() {
		platform.CreatedAt = now
	}
	platform.UpdatedAt = now

	r.mu.RLock()
	coll := r.platforms
	r.mu.RUnlock()

	_, err := coll.ReplaceOne(ctx, bson.M{"_id": platform.ID}, platform, options.Replace().SetUpsert(true))
	return err
}

func (r *Repository) ListPlatforms(ctx context.Context) ([]domain.Platform, error) {
	if ctx == nil {
		ctx = context.Background()
	}

	if err := r.ensureConnected(ctx); err != nil {
		return nil, err
	}

	r.mu.RLock()
	coll := r.platforms
	r.mu.RUnlock()

	cursor, err := coll.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var platforms []domain.Platform
	if err := cursor.All(ctx, &platforms); err != nil {
		return nil, err
	}
	return platforms, nil
}
