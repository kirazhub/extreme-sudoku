// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "SudokuEngine",
    products: [
        .library(name: "SudokuEngine", targets: ["SudokuEngine"]),
    ],
    targets: [
        .target(name: "SudokuEngine"),
        .testTarget(name: "SudokuEngineTests", dependencies: ["SudokuEngine"]),
    ]
)
