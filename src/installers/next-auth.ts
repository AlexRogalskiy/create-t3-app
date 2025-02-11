import type { Installer } from "./index.js";
import path from "path";
import fs from "fs-extra";
import { PKG_ROOT } from "../consts.js";
import { runPkgManagerInstall } from "../utils/runPkgManagerInstall.js";

export const nextAuthInstaller: Installer = async ({
  pkgManager,
  projectDir,
  packages,
  noInstall,
}) => {
  await runPkgManagerInstall({
    pkgManager,
    projectDir,
    packages: [
      "next-auth",
      packages?.prisma.inUse ? "@next-auth/prisma-adapter" : "",
    ],
    devMode: false,
    noInstallMode: noInstall,
  });

  const nextAuthAssetDir = path.join(PKG_ROOT, "template/addons/next-auth");

  const apiHandlerSrc = path.join(
    nextAuthAssetDir,
    packages?.prisma.inUse ? "api-handler-prisma.ts" : "api-handler.ts",
  );
  const apiHandlerDest = path.join(
    projectDir,
    "src/pages/api/auth/[...nextauth].ts",
  );

  const restrictedApiSrc = path.join(nextAuthAssetDir, "restricted.ts");
  const restrictedApiDest = path.join(
    projectDir,
    "src/pages/api/restricted.ts",
  );

  const nextAuthDefinitionSrc = path.join(nextAuthAssetDir, "next-auth.d.ts");
  const nextAuthDefinitionDest = path.join(projectDir, "next-auth.d.ts");

  await Promise.all([
    fs.copy(apiHandlerSrc, apiHandlerDest),
    fs.copy(restrictedApiSrc, restrictedApiDest),
    fs.copy(nextAuthDefinitionSrc, nextAuthDefinitionDest),
  ]);
};
