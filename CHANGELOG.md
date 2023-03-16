# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).


## [beta.2] - 2023-03-16

### Fixed

* Fix some problems related to Cubism Core.
  * See `CHANGELOG.md` in Core.


## [beta.1] - 2023-03-14

### Added

* Add `Expression` sample.
* Add immediate stabilization of physics.
* Add component `CubismMotionApplier` corresponding to `AnimationGraph`.
* Add function to validate MOC3 files.

### Fixed

* Fix an error in the default value when there is no Optional item in the Json parse result.
* Fix incorrect conditions for EyeBlink settings during import.
* Fix an error when an expression unused model was imported.
* Fix an error that occurred when the model mesh was moved with the manipulator and Undo was performed, resulting in incorrect drawing.
* Fix wrong name of options and fix module path. [@chichinohaha](https://github.com/chichinohaha)
* Fix a problem that prevented building and running on Cocos Creator.

### Changed

* Change the supported version of Cocos Creator to v3.7.1 or later.


## [alpha.1] - 2022-12-05

### Added

* New released!


[beta.2]: https://github.com/Live2D/CubismCocosCreatorComponents/compare/4-r.1-beta.1...4-r.1-beta.2
[beta.1]: https://github.com/Live2D/CubismCocosCreatorComponents/compare/4-r.1-alpha.1...4-r.1-beta.1
[alpha.1]: https://github.com/Live2D/CubismCocosCreatorComponents/releases/tag/4-r.1-alpha.1
