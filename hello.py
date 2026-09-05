#!/usr/bin/env python3
"""Simple greeting CLI script."""

import argparse


def build_greeting(name: str) -> str:
    return f"Hello, {name}!"


def main() -> None:
    parser = argparse.ArgumentParser(description="Print a friendly greeting.")
    parser.add_argument("--name", default="World", help="Name to greet (default: World)")
    args = parser.parse_args()

    print(build_greeting(args.name))


if __name__ == "__main__":
    main()
