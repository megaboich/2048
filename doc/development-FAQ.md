#FAQ for developers

## How to setup working environment
1. Install Node.js
2. Install IDE of you choise (Notepad++ or Visual Studio Code is enough)

## How to build project from command line
Navigate to project root (where README.md is located). Then Execute
```
build_app.cmd
```

## How to build and run unit tests from command line
Navigate to project root (where README.md is located). Then Execute
```
build_tests.cmd
```

## How to add new node.js package to project
Execute
```
npm install <package-name> --save
```

## How to add new d.ts definition for 3rd party javascript library from DefinitelyTyped.org
Execute
```
tsd install <package-name> --save
```