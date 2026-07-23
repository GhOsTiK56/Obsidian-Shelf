import { TFile } from "obsidian";

export interface RawFileData {
  title: string;
  type: string;
  status: string;
  poster: string;
  year: number; 
  file: TFile;
}

export abstract class MediaItem {
  public title: string;
  public type: string;
  public status: string;
  public poster: string
  public year: number;
  public file: TFile

  constructor(data: RawFileData) {
    this.title = data.title;
    this.type = data.type;
    this.status = data.status;
    this.poster = data.poster;
    this.year = data.year;
    this.file = data.file;
  }

  public getTitleName(): string {
    return `${this.title}`
  }
}