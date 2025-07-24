import { 
  Zap, 
  Users, 
  Package, 
  Database, 
  Shield, 
  Settings,
  TrendingUp 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleLogoProps {
  moduleId: string;
  personality?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export default function ModuleLogo({ 
  moduleId, 
  personality = "", 
  size = "md", 
  animated = false 
}: ModuleLogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const getModuleIcon = () => {
    switch (moduleId) {
      case "firestorm":
        return (
          <div className={cn(
            "rounded-lg bg-gradient-to-br from-red-500 via-orange-500 to-yellow-400 flex items-center justify-center shadow-xl",
            sizeClasses[size],
            animated && "animate-pulse"
          )}>
            <Zap className={cn(
              "text-white drop-shadow-lg",
              size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-6 h-6",
              animated && "animate-pulse"
            )} />
            {animated && (
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-red-600 rounded-lg opacity-30 animate-ping"></div>
            )}
          </div>
        );
        
      case "dream-portal":
        return (
          <div className={cn(
            "rounded-lg bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 flex items-center justify-center shadow-xl relative",
            sizeClasses[size]
          )}>
            <Users className={cn(
              "text-white drop-shadow-lg",
              size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-6 h-6"
            )} />
            {animated && (
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-600 rounded-lg opacity-40 animate-pulse"></div>
            )}
          </div>
        );
        
      case "velocify-hub":
        return (
          <div className={cn(
            "rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-xl relative",
            sizeClasses[size],
            animated && "animate-bounce"
          )}>
            <Package className={cn(
              "text-white drop-shadow-lg",
              size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-6 h-6"
            )} />
            {animated && (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-blue-600 rounded-lg opacity-30 animate-ping"></div>
            )}
          </div>
        );
        
      case "nexus-sync":
        return (
          <div className={cn(
            "rounded-lg bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600 flex items-center justify-center shadow-xl relative",
            sizeClasses[size]
          )}>
            <Database className={cn(
              "text-white drop-shadow-lg",
              size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-6 h-6"
            )} />
            {animated && (
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 rounded-lg opacity-40 animate-pulse"></div>
            )}
          </div>
        );
        
      case "zero-cb-fortress":
        return (
          <div className={cn(
            "rounded-lg bg-gradient-to-br from-amber-600 via-orange-500 to-red-500 flex items-center justify-center shadow-xl relative",
            sizeClasses[size]
          )}>
            <Shield className={cn(
              "text-white drop-shadow-lg",
              size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-6 h-6"
            )} />
            {animated && (
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-600 rounded-lg opacity-40 animate-pulse"></div>
            )}
          </div>
        );
        
      case "command-center":
        return (
          <div className={cn(
            "rounded-lg bg-gradient-to-br from-gray-700 via-slate-600 to-zinc-800 flex items-center justify-center shadow-xl relative",
            sizeClasses[size]
          )}>
            <Settings className={cn(
              "text-white drop-shadow-lg",
              size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-6 h-6",
              animated && "animate-spin"
            )} />
          </div>
        );
        
      default:
        return (
          <div className={cn(
            "rounded-lg bg-gradient-to-br from-slate-600 to-zinc-700 flex items-center justify-center shadow-xl",
            sizeClasses[size]
          )}>
            <TrendingUp className={cn(
              "text-white drop-shadow-lg",
              size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-6 h-6"
            )} />
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {getModuleIcon()}
    </div>
  );
}
