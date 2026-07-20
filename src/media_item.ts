export interface RawFileData {
  title: string;
  type: string;
  status: string;
  poster: string;
  year: number; 
}

export abstract class MediaItem {
  public title: string;
  public type: string;
  public status: string;
  public poster: string
  public year: number;

  constructor(data: RawFileData) {
    this.title = data.title;
    this.type = data.type;
    this.status = data.status;
    this.poster = data.poster;
    this.year = data.year;
  }

  public getFileInfo(): string {
    return `title: ${this.title}` + '\n'
     + `${this.type}` + '\n'
     + `${this.status}` + '\n'
     + `${this.poster}` + '\n'
     + `${this.year}` + '\n';
  }
}