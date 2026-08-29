#!/usr/bin/env ruby

require 'fileutils'
require 'xcodeproj'

project_path = 'ios/App/App.xcodeproj'
source_path = 'native/screenshot/CliniverseScreenshotTests.swift'
target_directory = 'ios/App/CliniverseScreenshots'
target_source_path = File.join(target_directory, 'CliniverseScreenshotTests.swift')
target_name = 'CliniverseScreenshots'

abort "Screenshot test source is missing: #{source_path}" unless File.file?(source_path)
abort "Generated iOS project is missing: #{project_path}" unless File.directory?(project_path)

FileUtils.mkdir_p(target_directory)
FileUtils.cp(source_path, target_source_path)

project = Xcodeproj::Project.open(project_path)
app_target = project.targets.find { |target| target.name == 'App' }
abort 'Generated App target was not found' unless app_target

existing_target = project.targets.find { |target| target.name == target_name }
existing_target.remove_from_project if existing_target

test_target = project.new_target(:ui_test_bundle, target_name, :ios, '15.0', nil, :swift)
test_target.add_dependency(app_target)
test_target.add_system_framework('XCTest')

test_group = project.main_group.find_subpath(target_name, true)
test_group.set_source_tree('<group>')
test_group.set_path(target_name)
source_reference = test_group.new_file('CliniverseScreenshotTests.swift')
test_target.add_file_references([source_reference])

test_target.build_configurations.each do |configuration|
  configuration.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = 'com.cliniverse.ai.screenshots'
  configuration.build_settings['GENERATE_INFOPLIST_FILE'] = 'YES'
  configuration.build_settings['TEST_TARGET_NAME'] = 'App'
  configuration.build_settings['TARGETED_DEVICE_FAMILY'] = '1,2'
  configuration.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.0'
  configuration.build_settings['SWIFT_VERSION'] = '5.0'
  configuration.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
  configuration.build_settings['CODE_SIGNING_REQUIRED'] = 'NO'
end

project.save

scheme = Xcodeproj::XCScheme.new
scheme.configure_with_targets(app_target, test_target, launch_target: true)
scheme.test_action.should_use_launch_scheme_args_env = false
scheme.save_as(project_path, target_name, true)

puts "Installed #{target_name} into #{project_path}"
