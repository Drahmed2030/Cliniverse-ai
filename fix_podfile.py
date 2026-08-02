import re

with open('ios/App/Podfile', 'r') as f:
    content = f.read()

post_install = """
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '14.0'
    end
  end
end
"""

if 'post_install' not in content:
    content += post_install

with open('ios/App/Podfile', 'w') as f:
    f.write(content)

print("Podfile fixed!")
