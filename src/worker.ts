import { createPlugin } from "@ubiquity-os/plugin-sdk";
import { Manifest } from "@ubiquity-os/plugin-sdk/manifest";
import { LogLevel } from "@ubiquity-os/ubiquity-os-logger";
import type { ExecutionContext } from "hono";
import manifest from "../manifest.json";
import { createAdapters } from "./adapters";
import { plugin } from "./plugin";
import { Command } from "./types/command";
import { SupportedEvents } from "./types/context";
import { Env, envSchema } from "./types/env";
import { PluginSettings, pluginSettingsSchema } from "./types/plugin-input";

export default {
  async fetch(request: Request, env: Record<string, string>, executionCtx?: ExecutionContext) {
    return createPlugin<PluginSettings, Env, Command, SupportedEvents>(
      (context) => {
        return plugin({
          ...context,
          adapters: {} as ReturnType<typeof createAdapters>,
        });
      },
      manifest as Manifest,
      {
        envSchema: envSchema,
        postCommentOnError: true,
        settingsSchema: pluginSettingsSchema,
        logLevel: env.LOG_LEVEL as LogLevel,
        kernelPublicKey: env.KERNEL_PUBLIC_KEY,
        bypassSignatureVerification: env.NODE_ENV === "local",
      }
    ).fetch(request, env, executionCtx);
  },
};
