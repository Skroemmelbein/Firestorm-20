#!/usr/bin/env node

// Automated Xano Database Setup Script
// This script will set up your complete Xano database structure

import fs from "fs";
import path from "path";

console.log("🚀 Starting Automated Xano Setup...\n");

// Your Xano credentials
const XANO_CREDENTIALS = {
  email: "shannonkroemmelbein@gmail.com",
  password: "ga8Q@H4hm@MDT69",
  workspace: "app.xano.com",
};

// Database table definitions
const XANO_TABLES = {
  communications: {
    fields: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      {
        name: "member_id",
        type: "integer",
        nullable: true,
        foreign_key: "members.id",
      },
      {
        name: "channel",
        type: "enum",
        values: ["sms", "email", "voice", "push"],
      },
      { name: "direction", type: "enum", values: ["inbound", "outbound"] },
      { name: "from_number", type: "text", nullable: true },
      { name: "to_number", type: "text", nullable: true },
      { name: "subject", type: "text", nullable: true },
      { name: "content", type: "text", required: true },
      {
        name: "status",
        type: "enum",
        values: ["queued", "sent", "delivered", "failed", "bounced"],
      },
      {
        name: "provider",
        type: "enum",
        values: ["twilio", "sendgrid", "other"],
      },
      { name: "provider_id", type: "text", nullable: true },
      { name: "provider_status", type: "text", nullable: true },
      { name: "error_message", type: "text", nullable: true },
      { name: "cost", type: "decimal", precision: 6, scale: 4, nullable: true },
      { name: "sent_at", type: "timestamp", nullable: true },
      { name: "delivered_at", type: "timestamp", nullable: true },
      { name: "read_at", type: "timestamp", nullable: true },
      { name: "replied_at", type: "timestamp", nullable: true },
      { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
      { name: "ai_generated", type: "boolean", default: false },
      {
        name: "ai_sentiment",
        type: "enum",
        values: ["positive", "neutral", "negative"],
        nullable: true,
      },
      { name: "ai_intent", type: "text", nullable: true },
      {
        name: "ai_confidence",
        type: "decimal",
        precision: 3,
        scale: 2,
        nullable: true,
      },
    ],
    indexes: [
      "member_id",
      "channel",
      "direction",
      "status",
      "created_at",
      "provider_id",
    ],
  },

  members: {
    fields: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      { name: "uuid", type: "text", unique: true, indexed: true },
      { name: "email", type: "text", unique: true, indexed: true },
      { name: "phone", type: "text", unique: true, indexed: true },
      { name: "first_name", type: "text" },
      { name: "last_name", type: "text" },
      {
        name: "status",
        type: "enum",
        values: ["active", "inactive", "suspended", "cancelled"],
      },
      {
        name: "membership_type",
        type: "enum",
        values: ["basic", "premium", "enterprise", "lifetime"],
      },
      { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
      { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
      { name: "last_login", type: "timestamp", nullable: true },
      { name: "profile_picture_url", type: "text", nullable: true },
      { name: "timezone", type: "text", nullable: true },
      { name: "language", type: "text", default: "en" },
      {
        name: "lifetime_value",
        type: "decimal",
        precision: 10,
        scale: 2,
        default: 0,
      },
      {
        name: "total_spent",
        type: "decimal",
        precision: 10,
        scale: 2,
        default: 0,
      },
      { name: "subscription_start_date", type: "timestamp", nullable: true },
      { name: "subscription_end_date", type: "timestamp", nullable: true },
      {
        name: "billing_cycle",
        type: "enum",
        values: ["monthly", "yearly", "lifetime"],
        nullable: true,
      },
      { name: "login_count", type: "integer", default: 0 },
      { name: "last_activity", type: "timestamp", nullable: true },
      { name: "engagement_score", type: "integer", default: 50 },
      { name: "email_notifications", type: "boolean", default: true },
      { name: "sms_notifications", type: "boolean", default: true },
      { name: "marketing_emails", type: "boolean", default: true },
    ],
    indexes: ["email", "phone", "status", "membership_type", "created_at"],
  },

  member_benefits: {
    fields: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      { name: "uuid", type: "text", unique: true, indexed: true },
      { name: "title", type: "text", required: true },
      { name: "description", type: "text" },
      {
        name: "benefit_type",
        type: "enum",
        values: ["discount", "access", "service", "product", "support"],
      },
      {
        name: "benefit_category",
        type: "enum",
        values: ["billing", "shipping", "support", "exclusive", "partner"],
      },
      { name: "value_description", type: "text" },
      { name: "conditions", type: "text", nullable: true },
      { name: "is_active", type: "boolean", default: true },
      { name: "membership_levels", type: "json" },
      { name: "sort_order", type: "integer", default: 0 },
      { name: "icon_name", type: "text", nullable: true },
      { name: "color_theme", type: "text", nullable: true },
      { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
      { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
      { name: "expires_at", type: "timestamp", nullable: true },
      { name: "usage_limit", type: "integer", nullable: true },
    ],
    indexes: ["is_active", "benefit_type", "benefit_category", "sort_order"],
  },

  member_benefit_usage: {
    fields: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      { name: "member_id", type: "integer", foreign_key: "members.id" },
      {
        name: "benefit_id",
        type: "integer",
        foreign_key: "member_benefits.id",
      },
      { name: "used_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
      { name: "usage_details", type: "json", nullable: true },
      {
        name: "discount_amount",
        type: "decimal",
        precision: 8,
        scale: 2,
        nullable: true,
      },
      { name: "order_id", type: "text", nullable: true },
      { name: "status", type: "enum", values: ["active", "used", "expired"] },
      { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
    ],
    indexes: ["member_id", "benefit_id", "used_at", "status"],
  },
};

// Sample data to populate tables
const SAMPLE_DATA = {
  members: [
    {
      uuid: "mem_001",
      email: "john.doe@example.com",
      phone: "+18144409968",
      first_name: "John",
      last_name: "Doe",
      status: "active",
      membership_type: "premium",
      engagement_score: 85,
      lifetime_value: 1250.0,
      total_spent: 890.5,
    },
    {
      uuid: "mem_002",
      email: "sarah.smith@example.com",
      phone: "+15551234567",
      first_name: "Sarah",
      last_name: "Smith",
      status: "active",
      membership_type: "enterprise",
      engagement_score: 92,
      lifetime_value: 2800.0,
      total_spent: 1590.25,
    },
    {
      uuid: "mem_003",
      email: "mike.wilson@example.com",
      phone: "+15559876543",
      first_name: "Mike",
      last_name: "Wilson",
      status: "active",
      membership_type: "basic",
      engagement_score: 67,
      lifetime_value: 450.0,
      total_spent: 285.75,
    },
  ],

  member_benefits: [
    {
      uuid: "ben_001",
      title: "10% Subscription Discount",
      description: "Get 10% off your monthly subscription renewal",
      benefit_type: "discount",
      benefit_category: "billing",
      value_description: "10% off monthly billing",
      membership_levels: '["premium", "enterprise"]',
      icon_name: "percent",
      color_theme: "green",
      is_active: true,
    },
    {
      uuid: "ben_002",
      title: "Priority Support",
      description: "Get priority customer support with faster response times",
      benefit_type: "service",
      benefit_category: "support",
      value_description: "24/7 priority support access",
      membership_levels: '["premium", "enterprise"]',
      icon_name: "headphones",
      color_theme: "blue",
      is_active: true,
    },
    {
      uuid: "ben_003",
      title: "Free Shipping",
      description: "Free shipping on all orders over $25",
      benefit_type: "service",
      benefit_category: "shipping",
      value_description: "Free shipping (orders $25+)",
      membership_levels: '["basic", "premium", "enterprise"]',
      icon_name: "truck",
      color_theme: "purple",
      is_active: true,
    },
  ],
};

// Setup instructions
const setupInstructions = () => {
  console.log("📋 XANO SETUP INSTRUCTIONS");
  console.log("==========================\n");

  console.log("1. 🔗 LOGIN TO XANO:");
  console.log(`   URL: https://${XANO_CREDENTIALS.workspace}`);
  console.log(`   Email: ${XANO_CREDENTIALS.email}`);
  console.log(`   Password: ${XANO_CREDENTIALS.password}\n`);

  console.log("2. 📊 CREATE TABLES:");
  Object.keys(XANO_TABLES).forEach((tableName, index) => {
    const table = XANO_TABLES[tableName];
    console.log(
      `   ${index + 1}. Create table: "${tableName}" (${table.fields.length} fields)`,
    );
  });
  console.log("");

  console.log("3. 🔌 CREATE API ENDPOINTS:");
  console.log("   - GET /api/members");
  console.log("   - POST /api/members");
  console.log("   - GET /api/communications");
  console.log("   - POST /api/communications");
  console.log("   - GET /api/member_benefits");
  console.log("   - POST /api/member_benefits\n");

  console.log("4. 📝 GET CREDENTIALS:");
  console.log("   - Copy Instance URL from browser");
  console.log("   - Create API Key in Settings");
  console.log("   - Get Database ID from settings\n");

  console.log("✅ Complete setup guide saved to: XANO_SETUP_GUIDE.sql\n");
};

// Generate SQL file for table creation
const generateSQLFile = () => {
  let sql = "-- RecurFlow Xano Database Setup\n";
  sql += "-- Generated automatically for your Xano workspace\n\n";

  Object.entries(XANO_TABLES).forEach(([tableName, table]) => {
    sql += `-- Table: ${tableName}\n`;
    sql += `CREATE TABLE ${tableName} (\n`;

    table.fields.forEach((field, index) => {
      sql += `  ${field.name} ${field.type.toUpperCase()}`;
      if (field.precision)
        sql += `(${field.precision}${field.scale ? `,${field.scale}` : ""})`;
      if (field.auto_increment) sql += " AUTO_INCREMENT";
      if (field.primary_key) sql += " PRIMARY KEY";
      if (field.unique) sql += " UNIQUE";
      if (field.nullable === false || field.required) sql += " NOT NULL";
      if (field.default !== undefined) sql += ` DEFAULT ${field.default}`;
      if (index < table.fields.length - 1) sql += ",";
      sql += "\n";
    });

    sql += ");\n\n";

    // Add indexes
    if (table.indexes) {
      table.indexes.forEach((indexField) => {
        sql += `CREATE INDEX idx_${tableName}_${indexField} ON ${tableName}(${indexField});\n`;
      });
      sql += "\n";
    }
  });

  // Add sample data
  sql += "-- Sample Data\n";
  Object.entries(SAMPLE_DATA).forEach(([tableName, records]) => {
    records.forEach((record) => {
      const fields = Object.keys(record).join(", ");
      const values = Object.values(record)
        .map((v) => (typeof v === "string" ? `'${v}'` : v))
        .join(", ");
      sql += `INSERT INTO ${tableName} (${fields}) VALUES (${values});\n`;
    });
    sql += "\n";
  });

  fs.writeFileSync("XANO_SETUP_GUIDE.sql", sql);
  console.log("📁 SQL file generated: XANO_SETUP_GUIDE.sql");
};

// Main setup function
const runSetup = () => {
  console.log("🎯 Automated Xano Setup for RecurFlow\n");

  setupInstructions();
  generateSQLFile();

  console.log(
    "🎉 Setup completed! Follow the instructions above to configure your Xano workspace.",
  );
  console.log(
    "💡 Pro tip: Copy the SQL from XANO_SETUP_GUIDE.sql to quickly create tables.",
  );
};

// Run the setup
runSetup();
