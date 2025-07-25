import { RequestHandler } from "express";
import { z } from "zod";

// War Chest Import Schema for 65,000 clients
const WarChestImportSchema = z.object({
  clients: z.array(z.object({
    // Core client data
    client_id: z.string(),
    legal_name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    
    // Historical data from "War Chest" vertical
    original_signup_date: z.string(),
    last_activity_date: z.string(),
    historical_plan: z.string(),
    
    // Status classification
    current_status: z.enum(["REWRITE", "FLIP", "BILL", "DORMANT", "DO_NOT_BILL"]),
    
    // NMI integration data
    nmi_customer_vault_id: z.string().optional(),
    payment_method_token: z.string().optional(),
    
    // Compliance data
    tos_acceptance: z.object({
      timestamp: z.string(),
      ip_address: z.string(),
      hash: z.string()
    }).optional(),
    
    // Billing history
    last_transaction_date: z.string().optional(),
    last_payment_amount: z.number().optional(),
    chargeback_history: z.array(z.object({
      date: z.string(),
      amount: z.number(),
      reason: z.string(),
      status: z.string()
    })).optional()
  })),
  
  // Import metadata
  import_batch_id: z.string(),
  vertical_name: z.string().default("War Chest"),
  total_expected_count: z.number(),
  import_started_by: z.string()
});

interface ImportProgress {
  batch_id: string;
  total_records: number;
  processed_records: number;
  success_count: number;
  error_count: number;
  status: "STARTED" | "PROCESSING" | "COMPLETED" | "FAILED";
  errors: Array<{
    record_index: number;
    client_id: string;
    error_message: string;
    error_code: string;
  }>;
  started_at: Date;
  completed_at?: Date;
}

// In-memory progress tracking (would be database in production)
const importProgress = new Map<string, ImportProgress>();

export const startWarChestImport: RequestHandler = async (req, res) => {
  try {
    const validation = WarChestImportSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid import data structure",
        errors: validation.error.issues
      });
    }

    const { clients, import_batch_id, vertical_name, total_expected_count, import_started_by } = validation.data;

    // Validate client count matches expected
    if (clients.length !== total_expected_count) {
      return res.status(400).json({
        success: false,
        message: `Client count mismatch. Expected ${total_expected_count}, got ${clients.length}`
      });
    }

    // Initialize import progress tracking
    const progress: ImportProgress = {
      batch_id: import_batch_id,
      total_records: total_expected_count,
      processed_records: 0,
      success_count: 0,
      error_count: 0,
      status: "STARTED",
      errors: [],
      started_at: new Date()
    };

    importProgress.set(import_batch_id, progress);

    // Start async processing
    processWarChestImport(validation.data, progress);

    res.json({
      success: true,
      message: `War Chest import started for ${total_expected_count} clients`,
      batch_id: import_batch_id,
      progress_endpoint: `/api/war-chest-import/progress/${import_batch_id}`
    });

  } catch (error: any) {
    console.error("War Chest import error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start War Chest import",
      error: error.message
    });
  }
};

async function processWarChestImport(data: z.infer<typeof WarChestImportSchema>, progress: ImportProgress) {
  progress.status = "PROCESSING";
  
  const { clients, import_batch_id } = data;
  const BATCH_SIZE = 100; // Process in batches to prevent memory issues

  try {
    for (let i = 0; i < clients.length; i += BATCH_SIZE) {
      const batch = clients.slice(i, i + BATCH_SIZE);
      
      // Process each client in the batch
      for (let j = 0; j < batch.length; j++) {
        const client = batch[j];
        const recordIndex = i + j;
        
        try {
          await processIndividualClient(client, import_batch_id);
          progress.success_count++;
        } catch (error: any) {
          progress.error_count++;
          progress.errors.push({
            record_index: recordIndex,
            client_id: client.client_id,
            error_message: error.message,
            error_code: error.code || "UNKNOWN_ERROR"
          });
        }
        
        progress.processed_records++;
      }

      // Add small delay between batches to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    progress.status = "COMPLETED";
    progress.completed_at = new Date();

    console.log(`War Chest import completed: ${progress.success_count} success, ${progress.error_count} errors`);

  } catch (error: any) {
    progress.status = "FAILED";
    progress.completed_at = new Date();
    console.error("War Chest import failed:", error);
  }
}

async function processIndividualClient(client: any, batchId: string) {
  // Validate client status
  if (!["REWRITE", "FLIP", "BILL", "DORMANT", "DO_NOT_BILL"].includes(client.current_status)) {
    throw new Error(`Invalid client status: ${client.current_status}`);
  }

  // Skip processing for DO_NOT_BILL clients
  if (client.current_status === "DO_NOT_BILL") {
    console.log(`Skipping DO_NOT_BILL client: ${client.client_id}`);
    return;
  }

  // Here you would:
  // 1. Insert into Xano database
  // 2. Handle NMI vault mapping
  // 3. Process payment method tokens
  // 4. Set up billing schedules for BILL status clients
  // 5. Queue for rewrite/flip processing

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 10));
  
  console.log(`Processed client ${client.client_id} with status ${client.current_status}`);
}

export const getImportProgress: RequestHandler = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const progress = importProgress.get(batchId);
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Import batch not found"
      });
    }

    res.json({
      success: true,
      progress: {
        ...progress,
        completion_percentage: Math.round((progress.processed_records / progress.total_records) * 100),
        estimated_time_remaining: calculateEstimatedTimeRemaining(progress)
      }
    });

  } catch (error: any) {
    console.error("Progress check error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get import progress",
      error: error.message
    });
  }
};

function calculateEstimatedTimeRemaining(progress: ImportProgress): string {
  if (progress.processed_records === 0) return "Calculating...";
  
  const elapsedTime = new Date().getTime() - progress.started_at.getTime();
  const recordsPerMs = progress.processed_records / elapsedTime;
  const remainingRecords = progress.total_records - progress.processed_records;
  const estimatedRemainingMs = remainingRecords / recordsPerMs;
  
  const remainingMinutes = Math.round(estimatedRemainingMs / (1000 * 60));
  
  if (remainingMinutes < 1) return "Less than 1 minute";
  if (remainingMinutes < 60) return `${remainingMinutes} minutes`;
  
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export const getImportStatus: RequestHandler = async (req, res) => {
  try {
    const activeImports = Array.from(importProgress.values())
      .filter(p => p.status === "PROCESSING" || p.status === "STARTED")
      .map(p => ({
        batch_id: p.batch_id,
        total_records: p.total_records,
        processed_records: p.processed_records,
        completion_percentage: Math.round((p.processed_records / p.total_records) * 100),
        status: p.status,
        started_at: p.started_at
      }));

    const completedImports = Array.from(importProgress.values())
      .filter(p => p.status === "COMPLETED" || p.status === "FAILED")
      .slice(-10) // Last 10 completed imports
      .map(p => ({
        batch_id: p.batch_id,
        total_records: p.total_records,
        success_count: p.success_count,
        error_count: p.error_count,
        status: p.status,
        started_at: p.started_at,
        completed_at: p.completed_at
      }));

    res.json({
      success: true,
      active_imports: activeImports,
      completed_imports: completedImports,
      total_active: activeImports.length
    });

  } catch (error: any) {
    console.error("Import status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get import status",
      error: error.message
    });
  }
};
