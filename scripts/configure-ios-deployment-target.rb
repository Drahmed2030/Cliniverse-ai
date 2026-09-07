#!/usr/bin/env ruby

require 'xcodeproj'

minimum_ios = '15.0'
project_path = ARGV.fetch(0, 'ios/App/App.xcodeproj')
podfile_path = ARGV.fetch(1, 'ios/App/Podfile')

abort("ERROR: generated Xcode project missing: #{project_path}") unless File.directory?(project_path)
abort("ERROR: generated Podfile missing: #{podfile_path}") unless File.file?(podfile_path)

project = Xcodeproj::Project.open(project_path)
app_target = project.targets.find { |target| target.name == 'App' }
abort('ERROR: generated App target was not found') unless app_target

app_target.build_configurations.each do |configuration|
  configuration.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = minimum_ios
end
project.save

podfile = File.read(podfile_path)
podfile.sub!(/platform :ios, ['"][0-9.]+['"]/, "platform :ios, '#{minimum_ios}'")
abort('ERROR: generated Podfile does not declare an iOS platform') unless podfile.include?("platform :ios, '#{minimum_ios}'")
File.write(podfile_path, podfile)

verified_project = Xcodeproj::Project.open(project_path)
verified_target = verified_project.targets.find { |target| target.name == 'App' }
targets = verified_target.build_configurations.map do |configuration|
  configuration.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
end

abort("ERROR: App deployment target drifted: #{targets.inspect}") unless targets.all? { |value| value == minimum_ios }

puts "PASS: generated App target and Pod platform require iOS #{minimum_ios}"
