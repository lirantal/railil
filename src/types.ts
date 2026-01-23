export interface Station {
  id: string;
  name: {
    he: string;
    en: string;
    ru: string;
    ar: string;
  };
}

export interface StationInfo {
  stationId: number;
  arrivalTime: string;
  departureTime: string;
  platform: number;
  predictedPctLoad?: number;
}

export interface Train {
  trainNumber: number;
  orignStation: number;
  destinationStation: number;
  originPlatform: number;
  destPlatform: number;
  arrivalTime: string;
  departureTime: string;
  stopStations: StationInfo[];
  routeStations: StationInfo[];
  handicap: number;
  isSamePlatformIsland: string;
}

export interface Travel {
  departureTime: string;
  arrivalTime: string;
  freeSeats?: number;
  trains: Train[];
}

export interface RailResponse {
  creationDate: string;
  version: string;
  successStatus: number;
  statusCode: number;
  errorMessages: null | string[];
  result: {
    numOfResultsToShow: number;
    startFromIndex: number;
    travels: Travel[];
  };
}

export interface SearchRequest {
  fromStation: string;
  toStation: string;
  date: string; // YYYY-MM-DD
  hour: string; // HH:MM
  scheduleType: 'ByDeparture' | 'ByArrival';
  systemType: string; // '2' seems to be the default
  languageId: string; // 'Hebrew' or 'English'
  methodName: string; // 'searchTrainLuzForDateTime'
}

export interface SearchResult {
  travels: Travel[];
  from: Station;
  to: Station;
}
