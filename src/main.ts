import { Plugin } from "obsidian";
import { logger } from "./logger";

export default class ObsidianShelf extends Plugin {
  async onload() {
    logger.info('Plugin Loaded')
  }

  onunload() {
    logger.info('Plugin Unloaded')
  }
}