#!/usr/bin/env node

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'

const sourcePath = 'native/ios/AppDelegate.swift'
const targetPath = 'ios/App/App/AppDelegate.swift'
const mainStoryboardPath = 'ios/App/App/Base.lproj/Main.storyboard'
const launchStoryboardPath = 'ios/App/App/Base.lproj/LaunchScreen.storyboard'

function block(message) {
  console.error(`RC BLOCKED: ${message}`)
  process.exit(2)
}

for (const path of [sourcePath, targetPath, mainStoryboardPath, launchStoryboardPath]) {
  if (!existsSync(path)) block(`required native launch file is missing: ${path}`)
}

const nativeSource = readFileSync(sourcePath, 'utf8')
if (!nativeSource.includes('CliniverseBridgeViewController')) {
  block('authoritative AppDelegate does not contain the launch guard')
}
copyFileSync(sourcePath, targetPath)

const defaultController = 'customClass="CAPBridgeViewController" customModule="Capacitor"'
const guardedController = 'customClass="CliniverseBridgeViewController" customModule="App" customModuleProvider="target"'
let mainStoryboard = readFileSync(mainStoryboardPath, 'utf8')

if (mainStoryboard.includes(defaultController)) {
  mainStoryboard = mainStoryboard.replace(defaultController, guardedController)
} else if (!mainStoryboard.includes(guardedController)) {
  block('generated Main.storyboard no longer contains the expected bridge controller contract')
}
writeFileSync(mainStoryboardPath, mainStoryboard)

const systemBackground = '<color key="backgroundColor" systemColor="systemBackgroundColor"/>'
const releaseBackground = '<color key="backgroundColor" red="0.03137254901960784" green="0.04705882352941176" blue="0.08627450980392157" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>'
let launchStoryboard = readFileSync(launchStoryboardPath, 'utf8')

if (launchStoryboard.includes(systemBackground)) {
  launchStoryboard = launchStoryboard.replace(systemBackground, releaseBackground)
} else if (!launchStoryboard.includes(releaseBackground)) {
  block('generated LaunchScreen.storyboard no longer contains the expected background contract')
}
writeFileSync(launchStoryboardPath, launchStoryboard)

console.log('PASS: native launch guard is installed in the generated iOS target')
