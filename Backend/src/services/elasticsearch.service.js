const { getClient, checkConnection, isElasticConnected } = require("../config/elasticsearch");

const CROP_INDEX = "crops";

/**
 * Initializes the Elasticsearch crops index with case-insensitive mappings.
 */
const initCropIndex = async () => {
  const client = getClient();
  if (!client) return false;

  const active = await checkConnection();
  if (!active) return false;

  try {
    const exists = await client.indices.exists({ index: CROP_INDEX });
    if (!exists) {
      await client.indices.create({
        index: CROP_INDEX,
        body: {
          settings: {
            analysis: {
              normalizer: {
                lowercase_normalizer: {
                  type: "custom",
                  char_filter: [],
                  filter: ["lowercase", "trim"],
                },
              },
            },
          },
          mappings: {
            properties: {
              id: { type: "keyword" },
              cropName: {
                type: "text",
                fields: {
                  raw: { type: "keyword", normalizer: "lowercase_normalizer" },
                },
              },
              category: {
                type: "text",
                fields: {
                  raw: { type: "keyword", normalizer: "lowercase_normalizer" },
                },
              },
              location: {
                type: "text",
                fields: {
                  raw: { type: "keyword", normalizer: "lowercase_normalizer" },
                },
              },
              farmerId: { type: "keyword" },
              farmerName: {
                type: "text",
                fields: {
                  raw: { type: "keyword", normalizer: "lowercase_normalizer" },
                },
              },
              pricePerKg: { type: "double" },
              quantity: { type: "double" },
              createdAt: { type: "date" },
            },
          },
        },
      });
      console.log(`Elasticsearch index '${CROP_INDEX}' created successfully.`);
    }
    return true;
  } catch (err) {
    console.warn("Elasticsearch index initialization error:", err.message);
    return false;
  }
};

/**
 * Index or update a crop document in Elasticsearch.
 */
const indexCrop = async (crop) => {
  const client = getClient();
  if (!client || !isElasticConnected()) return false;

  try {
    await client.index({
      index: CROP_INDEX,
      id: crop.id,
      document: {
        id: crop.id,
        cropName: crop.cropName,
        category: crop.category || "",
        location: crop.location || "",
        farmerId: crop.farmerId,
        farmerName: crop.farmer?.name || crop.farmerName || "",
        pricePerKg: crop.pricePerKg,
        quantity: crop.quantity,
        createdAt: crop.createdAt || new Date().toISOString(),
      },
      refresh: "wait_for",
    });
    return true;
  } catch (err) {
    console.warn(`Failed to index crop ${crop.id} in Elasticsearch:`, err.message);
    return false;
  }
};

/**
 * Delete a crop document from Elasticsearch index.
 */
const deleteCropIndex = async (cropId) => {
  const client = getClient();
  if (!client || !isElasticConnected()) return false;

  try {
    await client.delete({
      index: CROP_INDEX,
      id: cropId,
      refresh: "wait_for",
    });
    return true;
  } catch (err) {
    console.warn(`Failed to delete crop ${cropId} from Elasticsearch:`, err.message);
    return false;
  }
};

/**
 * Perform a case-insensitive search for crops using Elasticsearch.
 * Returns array of crop IDs or empty array on failure/no results.
 */
const searchCropsElastic = async (query = {}) => {
  const client = getClient();
  if (!client || !isElasticConnected()) return null;

  const { search, category, location, minPrice, maxPrice, farmerName } = query;

  const mustClauses = [];

  // Case-insensitive multi-field search for main search input
  if (search) {
    mustClauses.push({
      multi_match: {
        query: search.trim(),
        fields: ["cropName^3", "category^2", "location", "farmerName"],
        type: "phrase_prefix",
        case_insensitive: true,
      },
    });
  }

  // Case-insensitive category match
  if (category && category.toLowerCase() !== "all") {
    mustClauses.push({
      match: {
        category: {
          query: category.trim(),
          case_insensitive: true,
        },
      },
    });
  }

  // Case-insensitive location match
  if (location) {
    mustClauses.push({
      match: {
        location: {
          query: location.trim(),
          case_insensitive: true,
        },
      },
    });
  }

  // Case-insensitive farmer name match
  if (farmerName) {
    mustClauses.push({
      match: {
        farmerName: {
          query: farmerName.trim(),
          case_insensitive: true,
        },
      },
    });
  }

  const filterClauses = [];
  if (minPrice || maxPrice) {
    const rangeFilter = {};
    if (minPrice) rangeFilter.gte = parseFloat(minPrice);
    if (maxPrice) rangeFilter.lte = parseFloat(maxPrice);
    filterClauses.push({ range: { pricePerKg: rangeFilter } });
  }

  try {
    const response = await client.search({
      index: CROP_INDEX,
      body: {
        query: {
          bool: {
            must: mustClauses.length > 0 ? mustClauses : [{ match_all: {} }],
            filter: filterClauses,
          },
        },
      },
    });

    const hits = response.hits?.hits || [];
    const cropIds = hits.map((hit) => hit._id);
    return cropIds;
  } catch (err) {
    console.warn("Elasticsearch search failed:", err.message);
    return null; // Signals caller to fall back to Prisma DB search
  }
};

module.exports = {
  initCropIndex,
  indexCrop,
  deleteCropIndex,
  searchCropsElastic,
};
