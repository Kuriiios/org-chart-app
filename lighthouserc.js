module.exports = {
  ci: {
    collect: {
      // build + start a preview server on port 4173
      startServerCommand: 'npm run build && npm run preview -- --port=4173',
      url: ['http://localhost:4173/'],
      numberOfRuns: 3,
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};