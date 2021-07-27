How to set up Avadepth
1.	Download and install WAMP
2.	Start WAMP
  a.	If you haven’t already create a listening port
  b.	Right-click > tools > ports used by Apache > Add listen port > Enter desired port number
 
3.	Configure web server
a.	Go to Apache > httpd-vhosts.conf. Open the file.
b.	Copy the following:
```
<VirtualHost *:81>
	ServerName avadepth
	DocumentRoot "[Replace this with avadepth directory]"
	<Directory  "[Replace this with avadepth directory]">
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
c.	Go to Apache > Apache modules and ensure that proxy_module and proxy_http_module are enabled
4.	Restart all sessions
