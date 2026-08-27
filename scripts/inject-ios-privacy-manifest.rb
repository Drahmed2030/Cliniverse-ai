#!/usr/bin/env ruby
# frozen_string_literal: true

require 'xcodeproj'

project_path = ARGV.fetch(0, 'ios/App/App.xcodeproj')
manifest_path = ARGV.fetch(1, 'ios/App/App/PrivacyInfo.xcprivacy')

abort("ERROR: Xcode project missing: #{project_path}") unless File.directory?(project_path)
abort("ERROR: privacy manifest missing: #{manifest_path}") unless File.file?(manifest_path)

project = Xcodeproj::Project.open(project_path)
app_target = project.targets.find { |target| target.name == 'App' }
abort('ERROR: App target missing from generated Xcode project') unless app_target

app_group = project.main_group.groups.find do |group|
  group.path == 'App' || group.display_name == 'App'
end
abort('ERROR: App source group missing from generated Xcode project') unless app_group

manifest_reference = app_group.files.find { |file| file.path == 'PrivacyInfo.xcprivacy' }
manifest_reference ||= app_group.new_file('PrivacyInfo.xcprivacy')

unless app_target.resources_build_phase.files_references.include?(manifest_reference)
  app_target.resources_build_phase.add_file_reference(manifest_reference, true)
end

project.save

verified = app_target.resources_build_phase.files_references.any? do |reference|
  reference.path == 'PrivacyInfo.xcprivacy'
end
abort('ERROR: privacy manifest was not added to Copy Bundle Resources') unless verified

puts 'PASS: privacy manifest is a resource of the generated App target'
