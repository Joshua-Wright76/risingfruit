FORMAT: 1A

# Falling Fruit API

The Falling Fruit API provides access to the Falling Fruit database.

# Group Clusters

Clusters summarize the number of locations (for a single type) or types (for multiple types) available in an area.

## Cluster Collection [/clusters{?bounds,zoom,muni,types}]

### List Clusters [GET]

+ Parameters

    + bounds: `-180,180,-90,90` (string, required) - Map bounds as a comma-delimited string of coordinates in WGS84 decimal degrees ( `<west_longitude>,<east_longitude>,<south_latitude>,<north_latitude>`).
    + zoom (number, optional) - Zoom level (0 - 12), where the world is divided into a 2^zoom x 2^zoom grid.
        + Default: `0`
    + muni (boolean, optional) - Whether to count types at locations imported from municipal tree inventories.
        + Default: `true`
    + types (array, optional) - IDs of types to count (or all if empty or missing).

+ Response 200 (application/json)

        [
          {
            "lng": -105.26027,
            "lat": 40.01414,
            "count": 724
          }
        ]
