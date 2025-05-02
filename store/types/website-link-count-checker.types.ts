export interface IWebsiteLinkCountChecker {
    totalLinks: number
    internalLinks: number
    externalLinks: number
    brokenLinks: number
    topExternalDomains: { domain: string; count: number }[]
    topInternalPaths: { path: string; count: number }[]
    linkDistribution: {
      category: string
      count: number
    }[]
  }

  export interface IWebsiteLinkCountCheckerResponse {
  success: boolean;
  status: number;
  path: string;
  data: IWebsiteLinkCountChecker;
}

