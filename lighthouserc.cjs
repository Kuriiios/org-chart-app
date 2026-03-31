module.exports = {
  ci: {
    collect: {
      // staticDistDir lets lhci serve the built files itself — no Chrome config needed.
      // Run `npm run build` before `lhci autorun`.
      staticDistDir: './dist',
      numberOfRuns: 1,
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'categories:performance':    ['warn', { minScore: 0.8 }],
        'categories:accessibility':  ['warn', { minScore: 0.8 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo':            ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};