# Avadepth

Welcome to the project. This repository is responsible for hosting code related to Avadepth, a reporting application that helps mariners + shipping companies navigate the Fraser River South Arm Channel.

---

## Setting up your dev environment

### Prerequisites
- [WAMP](https://www.wampserver.com/en/)

### Getting up and running (using an http server)
- Download and install [the latest version of WAMP](https://www.wampserver.com/en/)
  - default installation options should be sufficient for running avadepth
- Start your WAMP server and confirm that the listening port assigned to Apache is available (microsoft uses port 80 on our gov laptops so you'll likely have to change the port):
  - A "W" wamp icon should appear in your taskbar (click arrow at bottom right corner of your screen) once Wamp is installed and running
  - To test if the default apache port is working, right-click the wamp icon in your taskbar > tools > ports used by Apache > Test port used. If the test fails, do the following:
	- Right-click the wamp icon in your taskbar > tools > ports used by Apache > Add listen port for Apache > Enter desired port number (e.g. 3000, 8081)
	- Right-click the wamp icon in your taskbar > tools > ports used by Apache > Use a port other than 80 > Enter the port number you entered in the previouse step
- Configure web server to work with Avadepth:
  - left-click the wamp icon in your taskbar > Apache > httpd-vhosts.conf. Open the file.
  - Replace the contents of the file with the following (**make sure you replace the content in square [ ] brackets with your own ports/directory paths**):
  ```
  <VirtualHost *:[INSERT-APACHE-PORT-NUMBER]>
  	ServerName avadepth
  	DocumentRoot "[INSERT-PATH-TO-AVADEPTH-DIRECTORY]"
  	<Directory  "[INSERT-PATH-TO-AVADEPTH-DIRECTORY]">
  		Options +Indexes +Includes +FollowSymLinks +MultiViews
  		AllowOverride All
  		Require local
  		DirectoryIndex index.html
  		AddOutputFilter INCLUDES .html
  	</Directory>
  	
  #Staging
  #ProxyPass "/api" "http://vapw-chin16.pwgsc.gc.ca/api"
  #ProxyPassReverse "/api" "http://vapw-chin16.pwgsc.gc.ca/api"
  ProxyPass "/api2" "http://vapw-chin16.pwgsc.gc.ca/api2"
  ProxyPassReverse "/api2" "http://vapw-chin16.pwgsc.gc.ca/api2"
  
  #ProxyPass "/api2" "http://www2.pac.dfo-mpo.gc.ca/api2"
  #ProxyPassReverse "/api2" "http://www2.pac.dfo-mpo.gc.ca/api2"
  ProxyPass "/api" "http://www2.pac.dfo-mpo.gc.ca/api"
  ProxyPassReverse "/api" "http://www2.pac.dfo-mpo.gc.ca/api"
  
  </VirtualHost>
  ```
  - Left-click the Wamp icon in your taskbar > Apache > Apache modules > enable/checkmark `proxy_module` and `proxy_http_module`
- Left-click the Wamp icon in your taskbar > Restart All Services (Wamp server icon should turn green if everything is working as intended)
- Open `http://localhost:<insert-apache-port-number>` to view Avadepth 

---

## Contribution guidelines

We follow the standard workflow of  `adopt a jira issue > branch off master > commit changes > create pull request`  

### Opening issues/Pull Requests

- All issues are managed in [jira](https://jira.tpsgc-pwgsc.gc.ca/projects/AVD/issues/)
- When creating an issue, choose the type (bug vs feature) and priority, then fill in the description
- For bug descriptions, please include steps to replicate
- For feature descriptions, please include context/the problem being solved + requirements (bonus points for possible solutions)
- For pull requests, please include recommended testing + desired behavior

### Creating and committing to a branch

- Update the status of your jira issue to `In Progress`
- Use [your jira issue's](https://jira.tpsgc-pwgsc.gc.ca/projects/AVD/issues/) "create branch" feature, and select the appropriate branch type (bug vs feature). Make sure to branch from master (unless you need to branch from another branch currently being reviewed).
- All branch names should include jira issue keys (e.g. feature/AVD-50, bugfix/AVD-30, etc)
- All commits should include the jira issue key of the branch (e.g. `git commit -m "AVD-30: Fixed bug X by doing Y"`)
- When you are finished your issue, create a pull request and change your jira issue status to `In Review`
