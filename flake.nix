{
  description = "Measure — a web-based tracking app";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_22
            nodePackages.npm
            nodePackages.typescript-language-server
            nodePackages.prettier
            nil
          ];

          shellHook = ''
            echo "Measure dev environment loaded"
            echo "Node $(node --version) | npm $(npm --version)"
          '';
        };
      }
    );
}
