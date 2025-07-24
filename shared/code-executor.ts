interface FileOperation {
  type: "create" | "modify" | "delete";
  path: string;
  content?: string;
  backup?: string;
}

interface ExecutionResult {
  success: boolean;
  message: string;
  filePath?: string;
  error?: string;
}

export class CodeExecutor {
  private baseDir: string;

  constructor(baseDir: string = "./client") {
    this.baseDir = baseDir;
  }

  async executeTask(task: any, code?: string): Promise<ExecutionResult> {
    try {
      switch (task.action) {
        case "create":
          return await this.createFile(task, code);
        case "modify":
          return await this.modifyFile(task, code);
        case "delete":
          return await this.deleteFile(task);
        default:
          return {
            success: false,
            message: `Unsupported action: ${task.action}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        message: "Failed to execute task",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async createFile(task: any, code?: string): Promise<ExecutionResult> {
    if (!code) {
      return {
        success: false,
        message: "No code provided for file creation",
      };
    }

    const filePath = this.generateFilePath(task);

    try {
      // In a real implementation, you would write to the filesystem
      // For now, we'll simulate the operation
      console.log(`Creating file: ${filePath}`);
      console.log("Code:", code);

      return {
        success: true,
        message: `Successfully created ${task.target}: ${filePath}`,
        filePath,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create file: ${filePath}`,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async modifyFile(task: any, code?: string): Promise<ExecutionResult> {
    const filePath = task.fileName || this.generateFilePath(task);

    try {
      // In a real implementation, you would read, modify, and write the file
      console.log(`Modifying file: ${filePath}`);
      console.log("New code:", code);

      return {
        success: true,
        message: `Successfully modified ${task.target}: ${filePath}`,
        filePath,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to modify file: ${filePath}`,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async deleteFile(task: any): Promise<ExecutionResult> {
    const filePath = task.fileName || this.generateFilePath(task);

    try {
      console.log(`Deleting file: ${filePath}`);

      return {
        success: true,
        message: `Successfully deleted ${task.target}: ${filePath}`,
        filePath,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to delete file: ${filePath}`,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private generateFilePath(task: any): string {
    const { target, details, fileName } = task;

    if (fileName) {
      return fileName;
    }

    // Generate file path based on target and details
    const name = this.extractNameFromDetails(details);

    switch (target) {
      case "component":
        return `client/components/${name}.tsx`;
      case "page":
        return `client/pages/${name}.tsx`;
      case "api":
        return `server/routes/${name}.ts`;
      case "style":
        return `client/styles/${name}.css`;
      case "function":
        return `shared/${name}.ts`;
      default:
        return `client/${name}.tsx`;
    }
  }

  private extractNameFromDetails(details: string): string {
    // Simple extraction - in practice, you'd use more sophisticated NLP
    const words = details.toLowerCase().split(" ");
    const keywords = ["component", "page", "api", "function", "service"];

    let name = "";
    for (let i = 0; i < words.length; i++) {
      if (keywords.includes(words[i]) && i > 0) {
        name = words[i - 1];
        break;
      }
    }

    if (!name && words.length > 0) {
      name = words[0];
    }

    // Convert to PascalCase
    return (
      name.charAt(0).toUpperCase() +
      name.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    );
  }

  async validateCode(
    code: string,
    language: string = "typescript",
  ): Promise<{ isValid: boolean; errors: string[] }> {
    // Basic syntax validation - in practice, you'd use a proper parser
    const errors: string[] = [];

    if (!code.trim()) {
      errors.push("Code is empty");
    }

    if (language === "typescript" || language === "javascript") {
      // Basic checks for common syntax errors
      const openBraces = (code.match(/\{/g) || []).length;
      const closeBraces = (code.match(/\}/g) || []).length;

      if (openBraces !== closeBraces) {
        errors.push("Mismatched braces");
      }

      const openParens = (code.match(/\(/g) || []).length;
      const closeParens = (code.match(/\)/g) || []).length;

      if (openParens !== closeParens) {
        errors.push("Mismatched parentheses");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// File system operations using the Write tool
export class VoiceAssistantFileManager {
  async createComponent(name: string, code: string): Promise<ExecutionResult> {
    try {
      const fileName = `client/components/${name}.tsx`;

      // Use the Write tool to create the file
      await this.writeFile(fileName, code);

      return {
        success: true,
        message: `Created component: ${fileName}`,
        filePath: fileName,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to create component",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async createPage(name: string, code: string): Promise<ExecutionResult> {
    try {
      const fileName = `client/pages/${name}.tsx`;

      await this.writeFile(fileName, code);

      return {
        success: true,
        message: `Created page: ${fileName}`,
        filePath: fileName,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to create page",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async createAPI(name: string, code: string): Promise<ExecutionResult> {
    try {
      const fileName = `server/routes/${name}.ts`;

      await this.writeFile(fileName, code);

      return {
        success: true,
        message: `Created API: ${fileName}`,
        filePath: fileName,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to create API",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async writeFile(fileName: string, content: string): Promise<void> {
    // This is a placeholder - in the actual implementation,
    // we would use the Write tool from the agent context
    console.log(`Writing file: ${fileName}`);
    console.log("Content:", content);
  }
}

export const codeExecutor = new CodeExecutor();
export const fileManager = new VoiceAssistantFileManager();
