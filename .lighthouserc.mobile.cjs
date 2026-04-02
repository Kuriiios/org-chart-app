// lighthouserc.mobile.js
module.exports = {
  ci: {
    collect: {
      // URLs to audit
      url: ['http://localhost:4173/'],
      // Use Chrome in mobile emulation mode
      settings: {
        preset: 'mobile', // Mobile device emulation
        throttlingMethod: 'simulate', // Simulate slow network/CPU
        throttling: {
          rttMs: 150,
          throughputKbps: 1600,
          cpuSlowdownMultiplier: 4,
        },
        screenEmulation: {
          mobile: true,
          width: 360,
          height: 640,
          deviceScaleFactor: 2.625,
          disabled: false,
        },
        formFactor: 'mobile',
      },
      numberOfRuns: 3, // Average over multiple runs
    },
    assert: {
      // Fail CI if scores drop below thresholds
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'interactive': ['error', { maxNumericValue: 4000 }],
      },
    },
    upload: {
      target: 'temporary-public-storage', // Or 'lhci' server
    },
  },
};
