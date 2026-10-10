import { z } from "zod";

const DEFAULT_MARS_BASE_URL = "https://mars.nasa.gov";

export const RoverSchema = z.enum(["curiosity", "perseverance", "opportunity", "spirit"]);
export const CameraSchema = z.string().optional();

export type Rover = z.infer<typeof RoverSchema>;

export interface NasaClientOptions {
  apiKey: string;
  baseUrl?: string;
}

interface RawImageItemsResponse {
  items: RawImageItem[];
  total?: number;
  page?: number;
  per_page?: number;
  more?: boolean;
}

interface RawImageItem {
  id: number;
  imageid: string;
  sol: number;
  instrument: string;
  url: string;
  date_taken?: string;
  mission: string;
  extended?: {
    filter_name?: string | null;
    sample_type?: string | null;
    url_list?: string | null;
  };
}

interface RawImageLatestResponse {
  latest_data: {
    total: number;
    latest: string;
    new_count: number;
    latest_sols: number[];
    latest_sol: number;
    sol_count: number;
  };
}

interface PerseveranceRawFeedResponse {
  images: PerseveranceRawImage[];
  sol?: number;
  total_images?: number;
  page?: number;
  per_page?: string;
}

interface PerseveranceRawImage {
  imageid: string;
  sol: number;
  date_taken_mars?: string;
  date_taken_utc?: string;
  image_files: {
    full_res?: string;
    large?: string;
    medium?: string;
    small?: string;
  };
  camera?: {
    instrument?: string;
    filter_name?: string;
  };
  caption?: string;
}

export class NasaMarsRoverClient {
  private readonly baseUrl: string;

  public constructor(options: NasaClientOptions) {
    this.baseUrl = options.baseUrl ?? DEFAULT_MARS_BASE_URL;
  }

  public listRovers() {
    return [
      {
        name: "curiosity",
        mission: "Mars Science Laboratory",
        currentNasaMissionCode: "msl",
        status: "active",
        landingDate: "2012-08-06",
        launchDate: "2011-11-26",
        currentPublicApi: `${this.baseUrl}/api/v1/raw_image_items`
      },
      {
        name: "perseverance",
        mission: "Mars 2020",
        currentNasaMissionCode: "mars2020",
        status: "active",
        landingDate: "2021-02-18",
        launchDate: "2020-07-30",
        currentPublicApi: `${this.baseUrl}/rss/api/?feed=raw_images&category=mars2020&feedtype=json`
      },
      {
        name: "opportunity",
        mission: "Mars Exploration Rover B",
        currentNasaMissionCode: "merb",
        status: "complete",
        landingDate: "2004-01-25",
        launchDate: "2003-07-07",
        currentPublicApi: "No current searchable raw-image feed found on mars.nasa.gov."
      },
      {
        name: "spirit",
        mission: "Mars Exploration Rover A",
        currentNasaMissionCode: "mera",
        status: "complete",
        landingDate: "2004-01-04",
        launchDate: "2003-06-10",
        currentPublicApi: "No current searchable raw-image feed found on mars.nasa.gov."
      }
    ];
  }

  public listCameras(rover?: Rover) {
    const cameras = {
      curiosity: [
        "FHAZ",
        "RHAZ",
        "NAVCAM",
        "MAST",
        "CHEMCAM",
        "MAHLI",
        "MARDI",
        "FHAZ_RIGHT_A",
        "FHAZ_LEFT_A",
        "RHAZ_RIGHT_A",
        "RHAZ_LEFT_A",
        "NAV_LEFT_A",
        "NAV_RIGHT_A",
        "MAST_LEFT",
        "MAST_RIGHT",
        "CHEMCAM_RMI"
      ],
      perseverance: ["EDL", "FHAZ", "RHAZ", "NAVCAM", "MCZ", "PIXL", "SHERLOC", "SUPERCAM", "WATSON", "ZCAM"],
      opportunity: ["FHAZ", "RHAZ", "NAVCAM", "PANCAM", "MINITES"],
      spirit: ["FHAZ", "RHAZ", "NAVCAM", "PANCAM", "MINITES"]
    };

    return rover ? cameras[rover] : cameras;
  }

  public async getPhotos(params: {
    rover: Rover;
    sol?: number;
    earthDate?: string;
    camera?: string;
    page?: number;
    limit?: number;
  }) {
    if (params.sol === undefined && params.earthDate === undefined) {
      throw new Error("Provide either sol or earthDate.");
    }

    if (params.sol !== undefined && params.earthDate !== undefined) {
      throw new Error("Provide only one of sol or earthDate, not both.");
    }

    if (params.rover === "curiosity") {
      return this.getCuriosityPhotos({ ...params, rover: "curiosity" });
    }

    if (params.rover === "perseverance") {
      return this.getPerseverancePhotos({ ...params, rover: "perseverance" });
    }

    throw new Error(
      `NASA's current public mars.nasa.gov raw-image APIs do not expose a searchable feed for legacy rover '${params.rover}'.`
    );
  }

  public async getLatestPhotos(params: { rover: Rover; camera?: string; limit?: number }) {
    if (params.rover === "curiosity") {
      const latest = await this.getCuriosityLatestData();
      return this.getCuriosityPhotos({
        rover: "curiosity",
        sol: latest.latest_data.latest_sol,
        camera: params.camera,
        limit: params.limit
      });
    }

    if (params.rover === "perseverance") {
      return this.getPerseverancePhotos({
        rover: "perseverance",
        camera: params.camera,
        limit: params.limit
      });
    }

    throw new Error(
      `NASA's current public mars.nasa.gov raw-image APIs do not expose latest-photo feeds for legacy rover '${params.rover}'.`
    );
  }

  public async getManifest(rover: Rover) {
    if (rover === "curiosity") {
      const latest = await this.getCuriosityLatestData();
      return {
        source: "mars.nasa.gov raw_image_items latest endpoint",
        photo_manifest: {
          name: "Curiosity",
          status: "active",
          landing_date: "2012-08-06",
          launch_date: "2011-11-26",
          max_sol: latest.latest_data.latest_sol,
          max_date: latest.latest_data.latest.replace(" UTC", "Z"),
          total_photos: latest.latest_data.total,
          latest_sols: latest.latest_data.latest_sols,
          recent_sol_count: latest.latest_data.sol_count,
          new_photo_count: latest.latest_data.new_count
        }
      };
    }

    if (rover === "perseverance") {
      const latest = await this.getPerseverancePhotos({ rover, limit: 1 });
      const latestPhoto = latest.photos[0];
      return {
        source: "mars.nasa.gov Mars 2020 raw images RSS API",
        photo_manifest: {
          name: "Perseverance",
          status: "active",
          landing_date: "2021-02-18",
          launch_date: "2020-07-30",
          max_sol: latestPhoto?.sol,
          max_date: latestPhoto?.earth_date,
          total_photos: latest.total_images
        }
      };
    }

    throw new Error(
      `NASA's current public mars.nasa.gov raw-image APIs do not expose mission manifests for legacy rover '${rover}'.`
    );
  }

  private async getCuriosityPhotos(params: {
    rover: "curiosity";
    sol?: number;
    earthDate?: string;
    camera?: string;
    page?: number;
    limit?: number;
  }) {
    const limit = params.limit ?? 25;
    const searchParams = new URLSearchParams({
      order: "sol desc,instrument desc,date_taken desc",
      per_page: String(limit),
      page: String(Math.max((params.page ?? 1) - 1, 0)),
      condition_1: "msl:mission",
      extended: "thumbnail::sample_type::noteq"
    });

    let conditionIndex = 2;
    if (params.sol !== undefined) {
      searchParams.set(`condition_${conditionIndex++}`, `${params.sol}:sol:gte`);
      searchParams.set(`condition_${conditionIndex++}`, `${params.sol}:sol:lte`);
    }

    if (params.earthDate !== undefined) {
      const nextDate = this.addDays(params.earthDate, 1);
      searchParams.set(`condition_${conditionIndex++}`, `${params.earthDate.replace(/-/g, "/")}:date_taken:gte`);
      searchParams.set(`condition_${conditionIndex++}`, `${nextDate}:date_taken:lt`);
    }

    const cameraSearch = this.curiosityCameraSearch(params.camera);
    if (cameraSearch) {
      searchParams.set("search", cameraSearch);
    }

    const result = await this.getJson<RawImageItemsResponse>("/api/v1/raw_image_items", searchParams);

    return {
      source: "mars.nasa.gov raw_image_items API",
      total: result.total,
      page: result.page,
      per_page: result.per_page,
      more: result.more,
      photos: result.items.map((item) => this.mapCuriosityPhoto(item))
    };
  }

  private async getPerseverancePhotos(params: {
    rover: "perseverance";
    sol?: number;
    earthDate?: string;
    camera?: string;
    page?: number;
    limit?: number;
  }) {
    if (params.earthDate !== undefined) {
      throw new Error("The current Mars 2020 raw-images feed supports sol-based retrieval, not Earth-date filtering.");
    }

    const searchParams = new URLSearchParams({
      feed: "raw_images",
      category: "mars2020",
      feedtype: "json",
      num: String(params.limit ?? 25),
      page: String(Math.max((params.page ?? 1) - 1, 0))
    });

    if (params.sol !== undefined) {
      searchParams.set("sol", String(params.sol));
    }

    const result = await this.getJson<PerseveranceRawFeedResponse>("/rss/api/", searchParams);
    const camera = params.camera?.toUpperCase();
    const photos = camera
      ? result.images.filter((image) => image.camera?.instrument?.toUpperCase().includes(camera))
      : result.images;

    return {
      source: "mars.nasa.gov Mars 2020 raw images RSS API",
      total_images: result.total_images,
      page: result.page,
      per_page: result.per_page,
      photos: photos.map((image) => this.mapPerseverancePhoto(image))
    };
  }

  private async getCuriosityLatestData() {
    return this.getJson<RawImageLatestResponse>("/api/v1/raw_image_items/msl/latest/", new URLSearchParams());
  }

  private mapCuriosityPhoto(item: RawImageItem) {
    return {
      id: item.id,
      imageid: item.imageid,
      sol: item.sol,
      earth_date: item.date_taken?.slice(0, 10),
      img_src: item.url,
      camera: {
        name: item.instrument,
        full_name: this.cameraFullName(item.instrument)
      },
      rover: {
        name: "Curiosity",
        mission: "Mars Science Laboratory",
        status: "active"
      },
      sample_type: item.extended?.sample_type,
      raw: item
    };
  }

  private mapPerseverancePhoto(image: PerseveranceRawImage) {
    return {
      id: image.imageid,
      imageid: image.imageid,
      sol: image.sol,
      earth_date: image.date_taken_utc?.slice(0, 10),
      img_src: image.image_files.large ?? image.image_files.medium ?? image.image_files.full_res ?? image.image_files.small,
      camera: {
        name: image.camera?.instrument,
        full_name: this.cameraFullName(image.camera?.instrument)
      },
      rover: {
        name: "Perseverance",
        mission: "Mars 2020",
        status: "active"
      },
      caption: image.caption,
      raw: image
    };
  }

  private curiosityCameraSearch(camera?: string) {
    const normalized = camera?.toUpperCase();
    if (!normalized) return undefined;

    const aliases: Record<string, string> = {
      FHAZ: "FHAZ_RIGHT_A|FHAZ_LEFT_A|FHAZ_RIGHT_B|FHAZ_LEFT_B",
      RHAZ: "RHAZ_RIGHT_A|RHAZ_LEFT_A|RHAZ_RIGHT_B|RHAZ_LEFT_B",
      NAVCAM: "NAV_LEFT_A|NAV_LEFT_B|NAV_RIGHT_A|NAV_RIGHT_B",
      MAST: "MAST_LEFT|MAST_RIGHT",
      CHEMCAM: "CHEMCAM_RMI"
    };

    return aliases[normalized] ?? normalized;
  }

  private cameraFullName(camera?: string) {
    const names: Record<string, string> = {
      FHAZ: "Front Hazard Avoidance Camera",
      RHAZ: "Rear Hazard Avoidance Camera",
      NAVCAM: "Navigation Camera",
      MAST: "Mast Camera",
      MAST_LEFT: "Mast Camera Left",
      MAST_RIGHT: "Mast Camera Right",
      CHEMCAM: "Chemistry and Camera Complex",
      CHEMCAM_RMI: "ChemCam Remote Micro-Imager",
      MAHLI: "Mars Hand Lens Imager",
      MARDI: "Mars Descent Imager",
      MCZ: "Mastcam-Z",
      PIXL: "Planetary Instrument for X-ray Lithochemistry",
      SHERLOC: "Scanning Habitable Environments with Raman and Luminescence for Organics and Chemicals",
      SUPERCAM: "SuperCam",
      WATSON: "Wide Angle Topographic Sensor for Operations and eNgineering",
      ZCAM: "Mastcam-Z"
    };

    return camera ? names[camera.toUpperCase()] ?? camera : undefined;
  }

  private addDays(date: string, days: number) {
    const parsed = new Date(`${date}T00:00:00Z`);
    parsed.setUTCDate(parsed.getUTCDate() + days);
    return `${parsed.getUTCFullYear()}-${parsed.getUTCMonth() + 1}-${parsed.getUTCDate()}`;
  }

  private async getJson<T>(path: string, searchParams: URLSearchParams): Promise<T> {
    const query = searchParams.toString();
    const url = `${this.baseUrl}${path}${query ? `?${query}` : ""}`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "nasa-mars-rover-mcp/0.1.0"
      }
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`NASA API request failed with ${response.status}: ${body}`);
    }

    return (await response.json()) as T;
  }
}
