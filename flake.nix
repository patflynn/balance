{
  description = "BALANCE — a web-based tracking app";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        balance = pkgs.buildNpmPackage {
          pname = "balance";
          version = "0.1.0";
          src = ./.;
          npmDepsHash = "sha256-xBXUd1o15mralA3fLXyjxLmC1JiBim9zSnQYDSXWW0k=";

          buildPhase = ''
            runHook preBuild
            npm run build
            runHook postBuild
          '';

          installPhase = ''
            runHook preInstall
            mkdir -p $out/{client/dist,server/dist,node_modules}
            cp -r client/dist/* $out/client/dist/
            cp -r server/dist/* $out/server/dist/
            cp -r node_modules $out/
            cp package.json $out/
            cp -r server/package.json $out/server/
            runHook postInstall
          '';
        };
      in
      {
        packages = {
          default = balance;

          oci-image = pkgs.dockerTools.buildLayeredImage {
            name = "balance";
            tag = "latest";
            contents = [
              pkgs.nodejs_22
              pkgs.cacert
            ];
            extraCommands = ''
              mkdir -p app/client app/server
              cp -r ${balance}/client/dist app/client/dist
              cp -r ${balance}/server/dist app/server/dist
              cp -r ${balance}/node_modules app/node_modules
              cp ${balance}/package.json app/package.json
              cp ${balance}/server/package.json app/server/package.json
            '';
            config = {
              Cmd = [
                "${pkgs.nodejs_22}/bin/node"
                "/app/server/dist/index.js"
              ];
              Env = [
                "NODE_ENV=production"
                "PORT=8080"
              ];
              ExposedPorts = {
                "8080/tcp" = { };
              };
              WorkingDir = "/app";
            };
          };
        };

        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_22
            nodePackages.typescript-language-server
            nodePackages.prettier
            nixfmt
            nil
          ];

          shellHook = ''
            echo "BALANCE dev environment loaded"
            echo "Node $(node --version) | npm $(npm --version)"
          '';
        };
      }
    );
}
