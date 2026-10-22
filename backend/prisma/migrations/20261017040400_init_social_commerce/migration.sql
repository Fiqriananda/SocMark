-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('user', 'creator', 'merchant', 'admin');

-- CreateEnum
CREATE TYPE "account_status" AS ENUM ('active', 'suspended', 'pending_verification');

-- CreateEnum
CREATE TYPE "product_status" AS ENUM ('draft', 'active', 'archived', 'out_of_stock');

-- CreateEnum
CREATE TYPE "item_condition" AS ENUM ('brand_new', 'like_new', 'good', 'fair');

-- CreateEnum
CREATE TYPE "post_type" AS ENUM ('image', 'carousel', 'video', 'text');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'disputed', 'cancelled');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('initiated', 'in_escrow', 'released_to_seller', 'refunded');

-- CreateEnum
CREATE TYPE "offer_status" AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(32) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(64) NOT NULL,
    "bio" TEXT,
    "avatar_url" TEXT,
    "cover_photo_url" TEXT,
    "role" "user_role" NOT NULL DEFAULT 'user',
    "status" "account_status" NOT NULL DEFAULT 'active',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_follows" (
    "follower_id" UUID NOT NULL,
    "following_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_follows_pkey" PRIMARY KEY ("follower_id","following_id")
);

-- CreateTable
CREATE TABLE "shops" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "shop_name" VARCHAR(64) NOT NULL,
    "slug" VARCHAR(64) NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "banner_url" TEXT,
    "rating_avg" DECIMAL(3,2) DEFAULT 5.00,
    "review_count" INTEGER DEFAULT 0,
    "stripe_account_id" VARCHAR(128),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "slug" VARCHAR(64) NOT NULL,
    "parent_id" INTEGER,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "category_id" INTEGER,
    "title" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "description" TEXT NOT NULL,
    "condition" "item_condition" NOT NULL DEFAULT 'brand_new',
    "status" "product_status" NOT NULL DEFAULT 'active',
    "base_price" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) DEFAULT 'USD',
    "has_variants" BOOLEAN DEFAULT false,
    "view_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "alt_text" VARCHAR(160),
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "sku" VARCHAR(64),
    "variant_name" VARCHAR(100) NOT NULL,
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "price_adjustment" DECIMAL(10,2) DEFAULT 0.00,
    "inventory_quantity" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "caption" TEXT,
    "post_type" "post_type" NOT NULL DEFAULT 'image',
    "media_urls" TEXT[],
    "like_count" INTEGER DEFAULT 0,
    "comment_count" INTEGER DEFAULT 0,
    "share_count" INTEGER DEFAULT 0,
    "is_shoppable" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_product_tags" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "media_index" INTEGER DEFAULT 0,
    "x_coordinate_pct" DECIMAL(5,2),
    "y_coordinate_pct" DECIMAL(5,2),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_product_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_likes" (
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("post_id","user_id")
);

-- CreateTable
CREATE TABLE "post_comments" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "parent_comment_id" UUID,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "order_number" VARCHAR(32) NOT NULL,
    "buyer_id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "status" "order_status" NOT NULL DEFAULT 'pending_payment',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "shipping_fee" DECIMAL(10,2) DEFAULT 0.00,
    "platform_fee" DECIMAL(10,2) DEFAULT 0.00,
    "tax_amount" DECIMAL(10,2) DEFAULT 0.00,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "shipping_address" JSONB NOT NULL,
    "tracking_number" VARCHAR(128),
    "shipping_carrier" VARCHAR(64),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_id" UUID,
    "item_title" VARCHAR(160) NOT NULL,
    "variant_title" VARCHAR(100),
    "unit_price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escrow_transactions" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "payment_processor_ref" VARCHAR(128) NOT NULL,
    "payment_status" "payment_status" NOT NULL DEFAULT 'initiated',
    "gross_amount" DECIMAL(10,2) NOT NULL,
    "net_seller_payout" DECIMAL(10,2) NOT NULL,
    "payout_release_due" TIMESTAMPTZ,
    "released_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escrow_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL,
    "participant_one" UUID NOT NULL,
    "participant_two" UUID NOT NULL,
    "associated_product_id" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "body" TEXT,
    "attachment_urls" TEXT[],
    "is_offer" BOOLEAN DEFAULT false,
    "offer_amount" DECIMAL(10,2),
    "offer_status" "offer_status",
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "user_follows_following_id_idx" ON "user_follows"("following_id");

-- CreateIndex
CREATE UNIQUE INDEX "shops_owner_id_key" ON "shops"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "shops_slug_key" ON "shops"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "products_shop_id_idx" ON "products"("shop_id");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_product_id_idx" ON "product_variants"("product_id");

-- CreateIndex
CREATE INDEX "posts_author_id_idx" ON "posts"("author_id");

-- CreateIndex
CREATE INDEX "posts_created_at_idx" ON "posts"("created_at" DESC);

-- CreateIndex
CREATE INDEX "post_product_tags_post_id_idx" ON "post_product_tags"("post_id");

-- CreateIndex
CREATE INDEX "post_product_tags_product_id_idx" ON "post_product_tags"("product_id");

-- CreateIndex
CREATE INDEX "post_comments_post_id_idx" ON "post_comments"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_buyer_id_idx" ON "orders"("buyer_id");

-- CreateIndex
CREATE INDEX "orders_shop_id_idx" ON "orders"("shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "escrow_transactions_order_id_key" ON "escrow_transactions"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_participant_one_participant_two_key" ON "conversations"("participant_one", "participant_two");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_product_tags" ADD CONSTRAINT "post_product_tags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_product_tags" ADD CONSTRAINT "post_product_tags_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "post_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_transactions" ADD CONSTRAINT "escrow_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_participant_one_fkey" FOREIGN KEY ("participant_one") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_participant_two_fkey" FOREIGN KEY ("participant_two") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_associated_product_id_fkey" FOREIGN KEY ("associated_product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
