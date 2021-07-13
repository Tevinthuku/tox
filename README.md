## Tox

Tox is a small programming language that has been inspired by the Jlox programming language from https://craftinginterpreters.com/

The scanner, parser & interpreter have all been built by hand, no external library has been involved

## Running Tox Locally

1. Clone this project
2. Create a `src` folder on the root.
3. Run `npm install` and `npm run build:watch`
4. Open a new terminal and run `node lib/tox.js file test.tox` to run a file (test.lox is in the root)
5. To run the repl run `node lib/tox.js repl`

## Syntax

The syntax is similar to Javascript for the most part.

### Variable declaration

```
let number = 12;
let name = "hundred";
```

### Looping

#### For loops

```
  for(let i = 0; i < 5; i = i + 1) {
    log i;
  }
```

#### While loops

```
let num = 0
while(num < 5) {
    log "Running";
    num = num + 1;
}
```

### Functions

```
fn greetings(name) {
    return "Hello " + name;
}

log greetings("World");
```

### Conditionals

```
let answer = "work";
if(answer == "work") {
    log "correct";
} else {
    log "try again";
}
```

```
log nil or "twelve"; // prints "twelve"
```

### Extra features.

#### Do Statement.
I took inspiration from the `do expression` that's currently an [Ecmascript expression](https://github.com/tc39/proposal-do-expressions) 

```
let a = 12;
do {
  if(a == 111) {
    log("true");
  } else {
    log("false"); //logs false here
  }
}
```
