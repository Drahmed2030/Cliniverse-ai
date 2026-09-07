#!/usr/bin/env ruby
# frozen_string_literal: true

require 'fileutils'
require 'xcodeproj'

project_path = ARGV.fetch(0, 'ios/App/App.xcodeproj')
source_path = ARGV.fetch(1, 'native/ios/CliniverseStoreKitPlugin.swift')
target_path = ARGV.fetch(2, 'ios/App/App/CliniverseStoreKitPlugin.swift')

abort("ERROR: Xcode project missing: #{project_path}") unless File.directory?(project_path)
abort("ERROR: StoreKit source missing: #{source_path}") unless File.file?(source_path)

FileUtils.cp(source_path, target_path)

project = Xcodeproj::Project.open(project_path)
app_target = project.targets.find { |target| target.name == 'App' }
abort('ERROR: App target missing from generated Xcode project') unless app_target

app_group = project.main_group.groups.find do |group|
  group.path == 'App' || group.display_name == 'App'
end
abort('ERROR: App source group missing from generated Xcode project') unless app_group

source_reference = app_group.files.find { |file| file.path == 'CliniverseStoreKitPlugin.swift' }
source_reference ||= app_group.new_file('CliniverseStoreKitPlugin.swift')

unless app_target.source_build_phase.files_references.include?(source_reference)
  app_target.source_build_phase.add_file_reference(source_reference, true)
end

project.save

verified = app_target.source_build_phase.files_references.any? do |reference|
  reference.path == 'CliniverseStoreKitPlugin.swift'
end
abort('ERROR: StoreKit plugin was not added to Compile Sources') unless verified

puts 'PASS: StoreKit plugin is compiled by the generated App target'
