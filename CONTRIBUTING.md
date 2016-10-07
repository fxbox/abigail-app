# Contributing to Project Abigail

## Where to start?

If you're new to the Project Abigail app and want to contribute, there is a
[list of good first bugs](https://github.com/project-abigail/app/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+bug%22).

## Coding standard

The code base is written in es2015, make sure to use semantic and syntactic
idioms in this flavour of JavaScript.

For CSS, we're following [BEM methodology](https://en.bem.info/methodology/).

The coding standard is not documented but most of the important features are
enforced using [eslint](http://eslint.org/). So it's really easy to get 
acquainted with the most of coding styles.

If there are any linting errors in your code, fix them until the report is 
successful.
It can also be helpful to take a look at the warnings and see if any parts of
your code can be improved.

## Coding style

Unlike coding standard, the coding style is not yet enforced or documented.
Please become familiar with the code base and make sure you respect the style in
place.

As an example of coding style, the promises are usually split and indented this
way:
```javascript
api.doPromise()
  .then((result) => {
    // Process result.
  });
```

## Testing

If your pull request fixes a bug in the code base, please write a unit or
integration test to avoid regression in the future.
