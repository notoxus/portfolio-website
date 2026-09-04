{
  description = "Portfolio Website - Fully Reproducible Developer Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };

        nodejs = pkgs.nodejs_24;
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            nodejs
            pkgs.corepack
            pkgs.git
            pkgs.docker
            pkgs.docker-compose
          ];

          shellHook = ''
            export PNPM_HOME="$HOME/.local/share/pnpm"
            export PATH="$PNPM_HOME:$PATH"
            echo "🚀 [Nix Flakes DevShell] Node $(node -v) | pnpm $(pnpm -v) loaded successfully!"
          '';
        };
      }
    );
}
