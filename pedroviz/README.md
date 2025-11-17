# A PedroPath visualizer

The **goal** is for this to be a _local_ application that let's you vizualize
and edit PedroPath's. The _reasons_ for this as opposed to just using
[vizualizer.pedropathing.com](https://visualizer.pedropathing.com/) are twofold:

1. When you're connected to the bot (for deployment, debugging, or using a
   panel) you can't use the Visualizer, so you have to launch it, then switch
   your wifi. BOOO!
2. This should integrate into your code. No more copying stuff back and forth!
   It will create the class for you, and allow you to name points, instead of
   just having random numerical names.

## Stuff I jotted down earlier:

- Image under a canvas that allows you to drag & drop points for paths.
- Names are auto generated, but editable.
- Select a robot path code source (different bots/teams)

**Tasks, in order:**

- [ ] Read simple path from code
- [ ] Display that path on the canvas.
- [ ] Allow editing paths in a text field
- [ ] Allow editing points by dragging & dropping on the canvas
- [ ] Reflect those changes in the code
- [ ] Animate the robot along the path
- [ ] Bonus: Reflect a path along a line or axis (with or without a bot offset?)

# Docs-n-stuff

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun pvdev
```

To run for production:

```bash
bun pvstart
```

I'm using [React](https://react.dev/),
[Typescript](https://www.typescriptlang.org/), with [Jotai](https://jotai.org/)
for state management and
[FluentUI](https://developer.microsoft.com/en-us/fluentui#/) as the UI/control
toolbox. None of them are too complicated, but each have their own sets of
weirdness. Feel free to reach out to me if you're trying to understand the code,
add a feature, or fix a bug.
