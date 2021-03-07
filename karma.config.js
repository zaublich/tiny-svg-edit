module.exports = function (config) {
    const tests = ['./tests/**/*.+(ts|tsx)'];
  
    config.set({
      singleRun: true,
      frameworks: ['mocha', 'webpack'], 
       plugins: [
        'karma-webpack',
        'karma-mocha',
        'karma-jsdom-launcher',
        'karma-firefox-launcher'
      ],
      files: tests,
    //   files: [
    //     "src/fillBodyjs.spec.js", // *.tsx for React Jsx
    //     "src/fillBodyts.spec.ts", // *.tsx for React Jsx
    //     "src/fillBodytsx.spec.tsx" // *.tsx for React Jsx
    // ],
      // preprocessors: {
      //   "**/*\.spec\.(ts|tsx)": "webpack",
      //   "**/*\.spec\.ts": "webpack",
      //   "**/*\.spec\.tsx": "webpack",
      //   // "**/*\.spec\.tsx": "webpack",
      //   "**/*.spec.js": "webpack",
      //   // "**/*.ts": "webpack", // *.tsx for React Jsx
      //   // "**/*.ts": "webpack", // *.tsx for React Jsx
      // },
      preprocessors: {
        [tests]: ['webpack']
      },
      webpack: webpackConfig(),
      webpackMiddleware: {
        noInfo: true
      },
      colors: true,
      browsers: ['jsdom'],
    });
  
  
  };
  
  function webpackConfig() {
    const config = require('./webpack.config.js');
    delete config.context;
    delete config.entry;
    delete config.output;  
    return config;
  }