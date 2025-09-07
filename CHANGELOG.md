# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.9.0](https://github.com/vad1ym/vue3-flashcards/compare/v0.6.3...v0.9.0) (2025-09-07)


### ⚠ BREAKING CHANGES

* delta value in slot data is no longer absolute; the sign now indicates direction
* separate flash and flip cards to be used independently

### Features

* add `flipAxis` prop to FlipCard for customizable flip direction ([ef8aae4](https://github.com/vad1ym/vue3-flashcards/commit/ef8aae479edc45b40fc080b0084681169175e43c))
* add `stackScale` prop to control stacking scale coefficient ([ab9f9e6](https://github.com/vad1ym/vue3-flashcards/commit/ab9f9e6e7e13c7394a96de1b2cc5d8138e9bc013))
* Add dragThreshold prop to prevent false positives from small movements ([ba62242](https://github.com/vad1ym/vue3-flashcards/commit/ba62242bf408738929f79630bd5ac08bf1a17786))
* add infinite swiping ([15427d2](https://github.com/vad1ym/vue3-flashcards/commit/15427d2f355a8ec25f8b50370e42883ea6f1f5e7))
* add maxDraggingX and maxDraggingY flashcards options ([f3e4ff7](https://github.com/vad1ym/vue3-flashcards/commit/f3e4ff7c2bf6d458d01d327b6baaa3232b56bbc5))
* add stacking feature ([94f788b](https://github.com/vad1ym/vue3-flashcards/commit/94f788b4bbf1a5213d5a87d843c2e70ec31ae285))
* add transformStyle prop to customize card rotation transform ([9fc16cb](https://github.com/vad1ym/vue3-flashcards/commit/9fc16cbf1e22088fd0882b0bd04aef29994c6314))
* add transitionName prop to customize card exit transition ([ef181fd](https://github.com/vad1ym/vue3-flashcards/commit/ef181fd51fd43098ad145c2f75cf6694725ae3d3))
* add waitAnimationEnd feature for flip card ([c47e8be](https://github.com/vad1ym/vue3-flashcards/commit/c47e8be256c4adc2c375608a01e7db5d91fda1b5))
* replace postcss with @tailwindcss/vite ([e55c4ef](https://github.com/vad1ym/vue3-flashcards/commit/e55c4efd23e880f709377c8ba9838a7fa8991e4e))
* separate flash and flip cards to be used independently ([14fd5aa](https://github.com/vad1ym/vue3-flashcards/commit/14fd5aaefe47ea0968ff07d6ecb553b02627633c))
* update dependencies ([8355287](https://github.com/vad1ym/vue3-flashcards/commit/835528722607449939ab8bb5576a6efed0446788))


### Bug Fixes

* flip card doesn't work for touch devices ([1381632](https://github.com/vad1ym/vue3-flashcards/commit/13816326fbf4318c879681e9a6080ee540c6ecfb))


### improve

* simplify logic and improve performance ([fea19b2](https://github.com/vad1ym/vue3-flashcards/commit/fea19b25f469d5e9beedb136a65007b6060b78e8))
