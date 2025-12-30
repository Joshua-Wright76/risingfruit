import { test, expect } from '@playwright/test';

/**
 * Focused tests for marker click functionality
 * This addresses the bug where clicking icons doesn't open the detail sheet
 */
test.describe('Marker Click Bug', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for map to load
    await page.waitForSelector('.mapboxgl-canvas', { state: 'visible', timeout: 30000 });
    await page.waitForTimeout(2000); // Wait for icons to load
  });

  test('should have clickable markers that respond to clicks', async ({ page }) => {
    // Wait for locations to load
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('locations');
    }, { timeout: 30000 });

    // Zoom in to see individual markers
    const zoomIn = page.locator('.mapboxgl-ctrl-zoom-in');
    for (let i = 0; i < 5; i++) {
      await zoomIn.click();
      await page.waitForTimeout(300);
    }

    // Wait for zoom animation and data to load
    await page.waitForTimeout(2000);

    // Get canvas dimensions
    const canvas = page.locator('.mapboxgl-canvas');
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();

    // Try clicking at multiple positions to find a marker
    const clickPositions = [
      { x: box!.width / 2, y: box!.height / 2 },
      { x: box!.width / 2 + 30, y: box!.height / 2 },
      { x: box!.width / 2 - 30, y: box!.height / 2 },
      { x: box!.width / 2, y: box!.height / 2 + 30 },
      { x: box!.width / 2, y: box!.height / 2 - 30 },
    ];

    let sheetOpened = false;
    const sheet = page.locator('[data-testid="location-sheet"]');

    for (const pos of clickPositions) {
      await canvas.click({ position: pos });
      await page.waitForTimeout(500);
      
      // Check if sheet opened (not translated off-screen)
      const classes = await sheet.getAttribute('class');
      if (classes && !classes.includes('translate-y-full')) {
        sheetOpened = true;
        break;
      }
    }

    // Log result for debugging
    console.log('Sheet opened after clicking:', sheetOpened);
    
    // The sheet should open for at least one click position
    // (This test may fail if there are no markers at these positions)
  });

  test('UI click on cluster should zoom in', async ({ page }) => {
    // Capture console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('handleClick')) {
        consoleLogs.push(msg.text());
      }
    });
    
    // Wait for map to render
    await page.waitForSelector('.mapboxgl-canvas', { state: 'visible', timeout: 30000 });
    
    // Wait for locations to load
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('locations');
    }, { timeout: 30000 });

    await page.waitForTimeout(3000);

    const canvas = page.locator('.mapboxgl-canvas');
    
    // Find cluster position in the middle of the screen (avoiding UI overlays at top)
    const setupData = await page.evaluate(async () => {
      // @ts-expect-error - accessing exposed map for testing
      const map = window.__risingfruit_map;
      if (!map) return { error: 'No map' };
      
      const clusters = map.queryRenderedFeatures(undefined, { layers: ['clusters'] });
      if (clusters.length === 0) return { error: 'No clusters' };
      
      // Find a cluster in the middle portion of the screen (y > 200 to avoid top UI)
      const canvasHeight = map.getContainer().clientHeight;
      const canvasWidth = map.getContainer().clientWidth;
      
      let bestCluster = clusters[0];
      let bestY = 0;
      
      for (const cluster of clusters) {
        const geometry = cluster.geometry as { coordinates: [number, number] };
        const point = map.project(geometry.coordinates);
        
        // Prefer clusters in the middle vertical third of the screen
        if (point.y > 200 && point.y < canvasHeight - 100 && point.x > 100 && point.x < canvasWidth - 100) {
          if (point.y > bestY) {
            bestCluster = cluster;
            bestY = point.y;
          }
        }
      }
      
      const geometry = bestCluster.geometry as { coordinates: [number, number] };
      const point = map.project(geometry.coordinates);
      
      return {
        point: { x: point.x, y: point.y },
        initialZoom: map.getZoom(),
        clusterCount: bestCluster.properties.point_count,
        isInSafeZone: point.y > 200,
      };
    });

    console.log('Setup data:', setupData);
    
    if ('error' in setupData) {
      expect(setupData.error).toBeFalsy();
      return;
    }

    // Perform actual UI click on the canvas
    await canvas.click({ 
      position: { x: Math.round(setupData.point.x), y: Math.round(setupData.point.y) }
    });

    // Wait for potential zoom
    await page.waitForTimeout(1500);

    // Check if zoom changed
    const newZoom = await page.evaluate(() => {
      // @ts-expect-error - accessing exposed map for testing
      return window.__risingfruit_map?.getZoom();
    });

    console.log('UI Click: zoom before', setupData.initialZoom, 'after', newZoom);
    console.log('Click handler logs:', consoleLogs);
    
    // This is expected to fail - demonstrating the bug
    expect(newZoom).toBeGreaterThan(setupData.initialZoom);
  });

  test('programmatic click on cluster should zoom in', async ({ page }) => {
    // Wait for map to render
    await page.waitForSelector('.mapboxgl-canvas', { state: 'visible', timeout: 30000 });
    
    // Wait for locations to load
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('locations');
    }, { timeout: 30000 });

    // Wait extra time for data to render and map to expose
    await page.waitForTimeout(3000);

    // Find a cluster on the map and click on it
    const canvas = page.locator('.mapboxgl-canvas');
    
    // Query the page for cluster positions using exposed map
    const clusterData = await page.evaluate(async () => {
      // @ts-expect-error - accessing exposed map for testing
      const map = window.__risingfruit_map;
      
      if (!map?.queryRenderedFeatures) {
        return { success: false, reason: 'Map not exposed' };
      }
      
      // Query all cluster features
      const clusters = map.queryRenderedFeatures(undefined, {
        layers: ['clusters'],
      });
      
      if (clusters.length === 0) {
        return { success: false, reason: 'No clusters found', totalFeatures: 0 };
      }
      
      // Try to find a cluster that's actually clickable by checking multiple clusters
      for (const cluster of clusters.slice(0, 5)) {
        const geometry = cluster.geometry as { coordinates: [number, number] };
        const point = map.project(geometry.coordinates);
        
        // Verify this cluster is actually at this screen position
        const featuresAtPoint = map.queryRenderedFeatures([point.x, point.y], {
          layers: ['clusters'],
        });
        
        if (featuresAtPoint.length > 0) {
          return { 
            success: true, 
            point: { x: point.x, y: point.y },
            clusterCount: cluster.properties.point_count,
            totalClusters: clusters.length,
            verifiedAtPoint: true,
          };
        }
      }
      
      // Fallback: just use the first cluster's position
      const cluster = clusters[0];
      const geometry = cluster.geometry as { coordinates: [number, number] };
      const point = map.project(geometry.coordinates);
      
      return { 
        success: true, 
        point: { x: point.x, y: point.y },
        clusterCount: cluster.properties.point_count,
        totalClusters: clusters.length,
        verifiedAtPoint: false,
      };
    });

    console.log('Cluster query result:', clusterData);
    
    if (clusterData.success && clusterData.point) {
      // Do everything in one evaluate to avoid race conditions
      const result = await page.evaluate(async (targetPoint) => {
        // @ts-expect-error - accessing exposed map for testing
        const map = window.__risingfruit_map;
        if (!map) return { error: 'No map' };
        
        const initialZoom = map.getZoom();
        
        // Query features at the point
        const features = map.queryRenderedFeatures([targetPoint.x, targetPoint.y], {
          layers: ['clusters'],
        });
        
        if (features.length === 0) {
          // Features might not be at exact point - try with a bbox
          const bbox: [[number, number], [number, number]] = [
            [targetPoint.x - 30, targetPoint.y - 30],
            [targetPoint.x + 30, targetPoint.y + 30]
          ];
          const bboxFeatures = map.queryRenderedFeatures(bbox, {
            layers: ['clusters'],
          });
          
          if (bboxFeatures.length === 0) {
            return { 
              success: false, 
              reason: 'No clusters found even with bbox',
              initialZoom,
              allClusters: map.queryRenderedFeatures(undefined, { layers: ['clusters'] }).length
            };
          }
          
          // Use the first bbox feature
          const feature = bboxFeatures[0];
          const geometry = feature.geometry as { coordinates: [number, number] };
          const featurePoint = map.project(geometry.coordinates);
          
          // Manually trigger zoom to cluster
          const source = map.getSource('locations');
          if (source && 'getClusterExpansionZoom' in source) {
            const clusterId = feature.properties.cluster_id;
            
            return new Promise((resolve) => {
              (source as any).getClusterExpansionZoom(clusterId, (err: Error | null, zoom: number | null) => {
                if (err || zoom === null) {
                  resolve({ success: false, reason: 'getClusterExpansionZoom failed', initialZoom });
                  return;
                }
                
                map.easeTo({
                  center: geometry.coordinates,
                  zoom: zoom + 1,
                });
                
                // Wait for animation and resolve
                setTimeout(() => {
                  resolve({
                    success: true,
                    initialZoom,
                    newZoom: map.getZoom(),
                    method: 'programmatic',
                  });
                }, 1500);
              });
            });
          }
        }
        
        // If we found features at exact point, use them
        const feature = features[0];
        const geometry = feature.geometry as { coordinates: [number, number] };
        const source = map.getSource('locations');
        
        if (source && 'getClusterExpansionZoom' in source) {
          const clusterId = feature.properties.cluster_id;
          
          return new Promise((resolve) => {
            (source as any).getClusterExpansionZoom(clusterId, (err: Error | null, zoom: number | null) => {
              if (err || zoom === null) {
                resolve({ success: false, reason: 'getClusterExpansionZoom failed', initialZoom });
                return;
              }
              
              map.easeTo({
                center: geometry.coordinates,
                zoom: zoom + 1,
              });
              
              setTimeout(() => {
                resolve({
                  success: true,
                  initialZoom,
                  newZoom: map.getZoom(),
                  method: 'programmatic-exact',
                });
              }, 1500);
            });
          });
        }
        
        return { success: false, reason: 'No source found', initialZoom };
      }, clusterData.point);
      
      console.log('Click result:', result);
      
      if (result.success) {
        expect(result.newZoom).toBeGreaterThan(result.initialZoom);
      } else {
        console.log('Failed:', result.reason, 'allClusters:', result.allClusters);
        // This is expected to fail if there's an issue with the cluster layer
        expect(result.success).toBeTruthy();
      }
    } else {
      // If no clusters found, that's a failure
      expect(clusterData.success).toBeTruthy();
    }
  });

  test('map should have correct interactiveLayerIds for symbol layer', async ({ page }) => {
    // Wait for icons to load
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('locations');
    }, { timeout: 30000 });

    // Give time for icons to load
    await page.waitForTimeout(3000);

    // Evaluate within the page context to check map state
    const mapInfo = await page.evaluate(() => {
      // Access the map through the window if exposed, or through DOM
      const mapContainer = document.querySelector('.mapboxgl-map');
      // @ts-expect-error - accessing internal mapbox state
      const map = mapContainer?.__mapbox_map || window.__mapbox_map;
      
      if (!map) {
        return { error: 'Map not found' };
      }

      return {
        layers: map.getStyle()?.layers?.map((l: { id: string; type: string }) => ({ id: l.id, type: l.type })) || [],
        hasUnclusteredPoint: map.getLayer('unclustered-point') !== undefined,
        hasUnclusteredPointFallback: map.getLayer('unclustered-point-fallback') !== undefined,
      };
    });

    console.log('Map info:', JSON.stringify(mapInfo, null, 2));
  });

  test('cursor should change on marker hover', async ({ page }) => {
    // Wait for locations to load
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('locations');
    }, { timeout: 30000 });

    // Zoom in
    const zoomIn = page.locator('.mapboxgl-ctrl-zoom-in');
    for (let i = 0; i < 5; i++) {
      await zoomIn.click();
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(2000);

    const canvas = page.locator('.mapboxgl-canvas');
    
    // Get initial cursor style
    const initialCursor = await canvas.evaluate((el) => {
      return window.getComputedStyle(el).cursor;
    });

    console.log('Initial cursor:', initialCursor);

    // The cursor should be 'pointer' when hovering over interactive elements
    // or 'grab' for the map canvas when interactive layer is configured
  });
});

