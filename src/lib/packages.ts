import { supabase } from "$lib/supabase"
import { getSignedURL } from "$lib/supabaseStorage"

const headers = {
	"Cache-Control": "max-age=0, s-maxage=3600",
	"Content-Type": "application/json"
}

export const getPackage = async (pkg) => {
	return {
		headers,
		body: `  {
    "name" : "wasp-${pkg}",
    "full_name" : "Torwent/wasp-${pkg}",
    "description" : "WaspScripts ${pkg} scripts.",
    "homepage_url" : "https://waspscripts.com/wasp-${pkg}-versions.json"
  }`
	}
}

export const getVersions = async () => {
	const headers = {
		"Cache-Control": "max-age=0, s-maxage=3600",
		"Content-Type": "application/json"
	}
	return {
		headers,
		body: `  [
    {
      "download_url" : "www.test.com/files.zip",
      "options_url" : "www.test.com/.simbapackage",
      "notes" : "notes about this version",
      "time" : "unixtimestamp",
      "name" : "versionname"
    },
    {
      "download_url" : "www.test.com/files.zip",
      "options_url" : "www.test.com/.simbapackage",
      "notes" : "notes about this version",
      "time" : "unixtimestamp",
      "name" : "versionname"
    }
  ]`
	}
}
