##FAQ for developers

### How to setup working environment
1. Install Node.js
2. Install IDE of your choise (Visual Studio Code for example or Notepad++ should be enough)
3. Navigate to root directory of project (where README.md is located) and execute in command line
```
npm update
```

### How to build project from command line
```
build_app.cmd
```

### How to build and run unit tests from command line
```
build_tests.cmd
```

### How to add new node.js package to project
```
npm install <package-name> --save
```

### How to add new d.ts definition for 3rd party javascript library from DefinitelyTyped.org
```
tsd install <package-name> --save
```

### How to perform debugging of TypeScript code
Build scripts are performing compilation with embedded source maps in debug mode. So any web browser with support of source maps is good enough.
Most recommended:
1. Google Chrome
2. Mozilla Firefox

### How to perform debugging of unit tests
1. Compile source code in 'tests' mode (build_tests.cmd)
2. Open 'lib/jasmine-standalone/SpecRunner.html' in web browser for debug.