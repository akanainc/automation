# Akana Automated Software Deployment
![Installer](images/header.png)

## Installer Script
The installer script is used manily to install the product.  At the time of installation, the installer script can create (`-c`) containers by invoking the container script below.

To run installer:

* Download and copy the appropriate files to intended server (`/opt/akana_sw/stage/install`)
* cd \<extracted location\>/install
* Extract `ps-automation.\<version\>.zip` somewhere (`unzip ps-automation.\<version\>.zip`)
* vi (or favorite editor) `properties/installer.properties`
* Update as needed
    * resources
    * features
* add appropriate environment and container property files to properties directory
* run `./installer.py -isc > createContainers.log`

All valid options are:

* `-i` install
* `-u` Update with new jar features
* `-p` Environment Properties file to use
* `-s` deploy scripts
* `-c` create containers
* `-m` monitor the container
* `--hostname=<hostname>`
* `--timeout=<timeout>`
* `--name=<container name>`
* `--key=<container key>`
* `--filepath` Path to the zip file that needs to be extracted
* `--installpath` Path to the installation, this should be used when an upgrade requires a completely new directory
* `--deployFiles` is an archive file that contains any extra files to be added to a containers deploy directory
* `--overwrite` is the option that will tell the installer to overwrite a directory that already exists.
* `--repository` is an option to be used when the lib directory is outside of the product home.  This is useful if using a shared location, mounted drive.
* `--javaopts` allows the script to override the default java options used at container startup.
* `--pmrunning` Should the script validate PM is running, prior to making calls to PM
* `--containerlog` Sets container build log level, defaults to 'ERROR'.  Valid values are: 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'
* `--databaselog` Sets database build log level, defaults to 'CRITICAL'.  Valid values are: 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'
* `--installerlog` Sets installer log level, defaults to 'ERROR'.  Valid values are: 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'
* `--jce` Tells the installer the location of the JCE to be extracted into the `/jre/lib/security` directory.  This needs to be downloaded from http://www.oracle.com/technetwork/java/javase/downloads/jce8-download-2133166.html and supplied at the time of installation.

## Container Script
The container script is only responsible for creating containers.  It will create however many container property files  exist in the property directory.  Container property files are any property file that doesn't contain the name `environment` or `default` in it.

The `environment.property` file is also required in the property directory.  This file will only exist once per server, no matter how many containers are being built on this image.

To run container as standalone:

* `cd <install dir>/sm8/scripts/Lib/soa/automation/properties`
* Update all property files correctly.  Delete the ones you don't want to create.
* `cd <install dir>/sm8/bin`
* run `./jython.sh ../scripts/Lib/soa/automation/containerManager.py -c > createContainers.log`

All valid options are:

* `-c` create containers
* `-d` Delete container(s) from the PM console
* `-m` monitor the container
* `--hostname=<hostname>`
* `--timeout=<timeout>`
* `--name=<container name>`
* `--key=<container key>`
* `--administrator` Administrator user for the console
* `--password` Password for the administrator user
* `--product` Which products containers should be deleted, defaults to 'PM'.  Valid values are: 'PM', 'CM', 'ND'
* `--version` Version of the containers.  Required when using the --product flag
* `--deployFiles` is an archive file that contains any extra files to be added to a containers deploy directory
* `--installpath` Path to the installation, this should be used when an upgrade requires a completely new directory
* `--pmrunning` Should the script validate PM is running, prior to making calls to PM
* `--containerlog` Sets container build log level, defaults to 'ERROR'.  Valid values are: 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'
* `--databaselog` Sets database build log level, defaults to 'CRITICAL'.  Valid values are: 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'
* `--installerlog` Sets installer log level, defaults to 'ERROR'.  Valid values are: 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'
    
### Logging
The Database and Container creation takes advantage of using a python logger [Python Logging](https://docs.python.org/2/library/logging.html).  
The log settings are as follows:

* CRITICAL
* ERROR
* WARN
* INFO
* DEBUG

The databaseLogger is defaulted to CRITICAL and the containerLogger is defaulted to only print messages at the ERROR level and above.  These are configured a property file named logging.config which is located in the properties directory of the installer.  You can lower the verbose settings of the logger by changing the level setting for the appropriate logger.

For instance, if you were creating a new database and did not want to see all of the statements but wanted to see informational messages, you would change the databaseLogger level to INFO.  But, if there is an issue, you could set 
this level to DEBUG and see all of the SQL statements as they are being ran.

### Container Monitoring

The scripts can monitor a running Akana container.  The script will continue to validate that the container is up and responding.

Once the container is no longer active, the script will call the delete operation to remove the container from the PM database.  This functionality is turned off by default.  To enable this feature, when creating a container, provide the `-m` flag.

**NOTE: This should not be a replacement for a load balancer health check.

### Delete Container

This feature allows a container to automatically be removed based off of a container key.  This function would be used to remove containers after an update containers has been added into the cluster or a de-scaling activity.  

This feature is invoked with the following steps:

* cd \<install dir\>/sm8/bin
* run ./jython.sh ../scripts/Lib/soa/automation/containerManager.py -d --hostname=\<PM hostname\> --administrator=\<Administrator to PM console\> --password=\<Administrator password\> --product=\<products, like PM\> --version=\<version of product, like 7.2.14\> --key=\<container key\> | tee /tmp/deleteContainer.log
* run `./jython.sh ../scripts/Lib/soa/automation/containerManager.py -d --hostname=https://awspm:9900 --administrator=admin --password=password --products=PM --version=7.2.14 --key=automatedPM_7214 | tee /tmp/deleteContainer.log`

This can be ran from any container in the environment.

   
## Property Files

### Password Encryption
Passwords can be encrypted prior to storing them in any of the property files.  When passwords are encrypted the property `container.passwords.encrypted` needs to be set to true.

The following steps are required to run the password encrypt utility.
1. From the automation zip archive, extract the ps-encryption archive file.
2. cd into the nodeLib directory.
3. npm install
4. npm install java
5. node index.js <text to be encrypted>

### Installer Property File

```
    #InstallSection
    # install.path and resources.location must be absolute
    install.path=/opt/akana_sw/
    resources.location=/opt/akana_sw/stage/resources/
    ## 8.3
    features=akana-platform-8.3.0.zip\
        ,akana-api-platform-8.3.0.zip\
        ,com.soa.saml2.websso_8.3.199579.zip\
        ,com.soa.security.provider.siteminder_8.3.199579.zip\
        ,com.akana.activity.normalize_8.2.0.zip\
        ,com.akana.activity.freemarker_8.3.0.zip\
        ,com.akana.activity.headers_8.2.1.zip\
        ,com.akana.devservices_8.2.1.zip\
        ,lifecyclemanagerplatform_8.0.0.00316.zip\
        ,com.akana.log4j.elasticsearch_8.3.0.zip
    jce.location=
    ncipher.location=
```

if installing multiple feature packs, the features properties would look like:

```
	features=akana-platform-8.3.0.zip\
        ,akana-api-platform-8.3.0.zip\
        ,com.soa.saml2.websso_8.3.199579.zip\
        ,com.soa.security.provider.siteminder_8.3.199579.zip\
        ,com.akana.activity.normalize_8.2.0.zip\
        ,com.akana.activity.freemarker_8.3.0.zip\
        ,com.akana.activity.headers_8.2.1.zip\
        ,com.akana.devservices_8.2.1.zip\
        ,lifecyclemanagerplatform_8.0.0.00316.zip\
        ,com.akana.log4j.elasticsearch_8.3.0.zip
```

### Environment Property File
A single environment property file is required for a given environment build out.  These are properties that will be shared across all containers that exist in a given environment.

#### Build Database
The _Create Container_ process can also build the Policy Manager and Community Manager database. This processing is controlled by the properties in the `DatabaseSection` part of the _Environment Property File_ shown below.

The scripted database build process is divided into two parts just like the database processing in the Admin Console:

1. **Database Create Task** is the equivalent of the "Create new database" option in Admin console. If the database 
already exists, it will be replaced with a new, empty database.
2. **Schema Management Task** populates the database with the tables and data needed by the selected features.

The database build process scans all of the OSGi bundles in the `sm8/lib` directory tree to locate the scripts and controls needed by these two tasks. It does not depend on anything in the `sm8/dbscripts` directory tree.
 
The database build Jython scripts included in the Automated Deployment package are designed so they can be easily used in the future to provide additional automation such as:

* Changing the database connect string or username and password
* Applying database updates
* Installing additional features in a container that include database script

Database configuration works in the following manner:

* database.configure=true -- Database process is called, if configuration is needed the following properties are used:
 * database.create=true and database.recreate=true -- Call DatabaseCreate Task & delete/recreate DB if it exists
 * database.create=true and database.recreate=false -- Call DatabaseCreate Task & fail if database exists
 * database.create=false -- Do not call DatabaseCreate Task
* database.configure=false -- Database process is bypassed

Database scripts can be completely script.  This will allow the configuration of the database configuration file, but it will ignore any upgrade scripts that are found.  If this feature is desired, add `database.run.dbscripts=false` into the environment.properties file.  This is an optional property and is not required to exist in the property file.  This will default to true if it does not exist.

The following schema's can be installed into a database:

* pm
* cm
* oauth
* laas
* upgrade52
* pmdp
* wcf
* ims
* websso
* lm
* database.custom - is used for any custom schema changes.  This is a comma separated field of all custom schema's  `database.custom=ps.common.schema`

Specify the configuration values for this database

| key          | restrict | description                                      |
| ------------ | -------- | ------------------------------------------------ |
| databaseType |          | 'mssql', 'mysql', 'oracle', 'oracle-sn', 'db2'   |
| user         |          | Database connect userid                          |
| password     |          | Plain-text password for that user                |
| server       |          | Database host name                               |
| port         |          | Database port                                    |
| database     |          | Name of the database (tablespace for oracle*)    |
| instance     | mssql    | MS SQL Server "instance name"				     |
| instanceName | oracle*  | Oracle SID or Service Name (for oracle-sn)	     |
| tablespace   | db2      | DB/2 Table Space name						     |
| bufferName   | db2      | DB/2 Buffer Pool							     |
| isNewBuffer  | db2      | flag to create a new Buffer Pool			     |
| maxPoolSize  |          | Maximum number of database connections		     |
| minPoolSize  |          | Minimum number of open, idle connections	     |
| maxWait      |          | Maximum time to wait for an available connection |

#### Configure MongoDB
MongoDB configuration is required when the feature `Akana MongoDB Support' (mongo.db) has been installed into the Policy 
Manager container.  Mongo configuration is accomplished by using the environment.properties file.  Populate the 
following fields with the correct values:
  
```
    #Mongo DB Configuration
    mongodb.thread=20
    mongodb.enabled=false
    mongodb.host=
    mongodb.port=
    mongodb.password=
    mongodb.username=
```

#### Property File

```
    #InstallSection
    install.path=/opt/akana_sw/
    
    #DatabaseSection
    database.create=true
    # if database create and the database already exist, what should we do
    database.recreate=true
    # Should the scripts run any needed dbscripts
    database.run.dbscripts=true
    # Check the required schemas
    database.pm=true
    database.cm=false
    database.oauth=false
    database.laas=false
    database.upgrade52=false
    database.pmdp=false
    database.wcf=false
    database.ims=false
    database.websso=false
    database.lm=false
    # database.custom is used for any custom schema changes.  This is a comma separated field of all custom schema's  `database.custom=ps.common.schema`
    database.custom=
    #  	Specify the configuration values for this database
    #    	key       |restrict | description         
    #   -------------+---------+--------------------------------------------------
    #   databaseType |         | 'mssql', 'mysql', 'oracle', 'oracle-sn', 'db2'
    #   user         |         | Database connect userid
    #   password     |         | Plain-text password for that user
    #   server       |         | Database host name
    #   port         |         | Database port
    #   database     |         | Name of the database (tablespace for oracle*)
    #   instance     | mssql   | MS SQL Server "instance name"
    #   instanceName | oracle* | Oracle SID or Service Name (for oracle-sn)
    #   tablespace   | db2     | DB/2 Table Space name
    #   bufferName   | db2     | DB/2 Buffer Pool
    #   isNewBuffer  | db2     | flag to create a new Buffer Pool
    #   maxPoolSize  |         | Maximum number of database connections
    #   minPoolSize  |         | Minimum number of open, idle connections
    #   maxWait      |         | Maximum time to wait for an available connection
    #   -------------+---------+--------------------------------------------------
    # Common Properties
    database.type=
    database.user=
    database.password=
    database.admin=
    database.admin.password=
    database.host=
    database.port=
    # For oracle use the tablespace
    database.name=
    database.max.pool.size=30
    database.min.pool.size=3
    database.max.wait=30000
    database.jar=
    # mssql/oracle specific, only populate for mssql or oracle
    database.instance.name=
    # db2 specific, only populate for db2
    database.tablespace=
    database.bufferName=
    database.isNewBuffer=
    
    #ProxySection
    proxy.url=
    proxy=
    proxy.user=
    proxy.password=
    
    #Mongo DB Configuration
    mongodb.thread=20
    mongodb.enabled=false
    mongodb.host=
    mongodb.port=
    mongodb.password=
    mongodb.username=
```

### Container Property Files
A uniquely named container file should be provided for every container that needs to be built and configured for a 
specific environment.  So, if a PM and ND nodes are needed an a single host, it would be required for 2 uniquely named 
container property files.

For a secured container, include the secured flag as true.  Two different JAVA keystores are required for a secure container.  The container keystore `container.secure.keystore` contains the container private key, the second keystore `container.secure.trusted.keystore` contains the trusted certificates for all the containers and listeners in the environment.  If the container identity certificate has a different password then the container keystore, provide the property `container.secure.alias.password`.  At the same time, the `com.soa.security` category will be appropriately updated and the crl flag will be set to false in the `com.soa.crl` category.

Only container required fields are needed in a properties file.  The automation allows property fields to be omitted.  
The following lists what is required based off of the container type:

+ All Containers
    * Common Properties section
    * Features section
    	- Features that are set to true
    * Plugin section
    	- Plugins that are set to true
    * Tool section
    	- Tools that are set to true
    * Configuration Files section (specific properties depends on container type)
        - database.configure
        - proxy.filename
        - route.definitions
        - wsmex.address
    * Hardening Section 
        - container.harden
        - if container.harden is true
            + harden.ignoreCookies
            + harden.secureCookies
            + harden.cipherSuites
            + harden.enabledProtocols
            + harden.cache.expirationPeriod
            + harden.cache.refreshTime
    * Performance Section
        - container.performance
        - if container.performance is true all properties are required
+ CM Only
    * Tenant Properties section
    * Hardening Section
        - if container.harden is true
            + harden.cm.interceptor.blocked
            + harden.cm.allowed.hosts
            + harden.cm.csrf.enabled
            + harden.cm.exception.urls
            + harden.cm.keywords
            + harden.cm.validate
            + harden.cm.x.frame
+ ND Only
    * Configuration Files section
        - org=uddi:soa.com:registryorganization
        - cluster
        - remote.writer.enabled
    * Hardening Section
        - if container.harden is true
            + harden.nd.interceptor.blocked
            + harden.nd.replace.host
            + harden.nd.security.expiration.period
            + harden.nd.security.refresh.time

Automation supports building route files.  For more information on route files see https://support.soa.com/support/index.php?_m=knowledgebase&_a=viewarticle&kbarticleid=607.  
In the container property file, all route files are defined in a the property `route.definitions=`.  An example of an ND routing back through a clustered PM.  The property is configured like `filename;pattern;url`, each route file definition would be seperated by a comma.  Route files can also be added with providing the --deployFiles command switch.  See: https://library.akana.com/display/MAIN/Routing+Network+Director+through+the+F5

Managing cluster support.  Automation will automatically register an any container into a Cluster that is created in PM.  If a cluster name is provided and the cluster doesn't exist, the cluster will first be created.  Once the cluster is 
created, the new container is then added into this cluster.

Container location is used when adding a cluster or gateway container is added as a deployment zone inside the API Portal.  This needs to
 be a GPS location of the cluster or container.  This field needs to look something like ``.  These fields need to be set based on the 
 location you want to set.
```
    # Used to set the location for this container that is being created
    nd.location=
    # Used when creating a new cluster to set the location of the cluster
    cluster.location=
```

New deployment zones are created when either a new cluster is created or when a gateway is added, but not added to a 
cluster.  When a deployment zone is required to be created, the gateway container needs to know how to invoke the 
deployment zone API in the portal.  This requires the portal to be deployed prior to the gateway and the following 
properties to also be included:
```
    # Required when ND needs to invoke CM provided APIs.  Provide CM address only if CM is not deployed with PM.
    cm.address=
    cm.admin.user=
    cm.admin.password=

```

Listeners can be created for both ND and clusters.  By default, ND will automatically have a listener for the default interface and port that the container was built to listen on.  For additional required listeners, ND listeners are 
populated with `nd.listener=` and cluster listeners are populated in `cluster.listener=`.  Both of these fields are 
comma seperated fields.  Within each of these fields they are separated by a `:`, so to create a default http listener 
it would look like `default_http0:hostname:9905:http:idleTimeout:poolMax:poolMin:bind:alias:aliasPassword`.  The alias 
and alias password properties are only required if an https listener is being created.

* Name: `default_http0`, defines the name of this listener.  
* Hostname: `hostname`, defines the hostname that is hosting the ND/cluster container.  
* Port: the port that is listening for that container.  
* Protocol: the protocol, this needs to be either 'http' or 'https'. 
* Timeout: the idle timeout of the listener, the default value is '1800000'.
* Max connections: the max number of connections allowed, the default value is '100'.
* Minimum connections: the minimum number of connections that always remain, the value default is '5'.
* Bind: the bind to all interfaces, this needs to be either 'true' or 'false'.
* Alias: the alias to a key that is in the `container.secure.keystore`.
* Alias password: the alias password is an optional field and is only required if the key has a password that is 
different than the containing keystore.

When securing listeners, PKI keys can also be automatically added onto the endpoints.  These certificates need to be added into a custom JKS and provided to the automation scripts.  The property files used for these certificates are  `container.secure.keystore`, `container.secure.storepass` and `container.secure.alias`.  If no JKS is provided an exception will occur, requiring that a JKS is required to add secured endpoints.

Default container listener can be customized by providing the `container.listener.minimum`, `container.listener.maximum` amd `container.listener.idleTimeout`.  These fields will be used to update the default listener that is created when building a container.  This is mostly recommended for the Policy Manager and Community Manager containers.

If the default container listener is secured, the container identity cert will be used as the PKI.  This PKI can be updated when the container is created.  By including the property `container.listener.pki.alias`, the automation scripts will add this key to the default listener.  If this key has a different password then the keystore, the property `container.listener.pki.alias.password` needs to be supplied.  The keystore, `container.secure.keystore`, must include both the key and the certificate.

`--deployFiles` command line option is used to add extra files into a container deploy directory.  This is a final step that occurs.  This can be used for any custom policies or route file definitions.

#### Configure Container Properties
When ND is writing any analytical data through PM, the remote writer needs to be enabled.  The following property needs to be added into the ND container property file.
```
	# disable the remote usage writer in ND containers
    remote.writer.enabled=true
```

To view all services that are deployed into any container, the jetty information servlet needs to be enabled.
``` 
    # com.soa.platform.jetty.cfg
    jetty.information.servlet.enable=true
```

Add the following property if it is required that ND follows all redirects
``` 
    # com.soa.http.client.core.cfg ND only
    http.client.params.handleRedirects=true
```


``` 
    # com.soa.binding.http.cfg ND only
    http.in.binding.virtualhost.endpoint.selection.enabled=false
```

com.soa.binding.soap

| Property | Setting | Notes |
|----------|---------|-------|
| soap.in.binding.virtualhost.endpoint.selection.enabled | false |  |
| soap.in.binding.component.supportGetWsdl | true | Might want to disable this to block WSDL access from Internet |
| soap.out.binding.component.checkForNon500Faults | false | This prevents false XML parsing errors for non-500, non-fault responses |

``` 
    # com.soa.binding.soap.cfg ND only
    soap.in.binding.virtualhost.endpoint.selection.enabled=false
    soap.in.binding.component.supportGetWsdl=true
    soap.out.binding.component.checkForNon500Faults=false
```


``` 
    # com.soa.compass.settings.cfg
    compass.engine.optimizer.schedule=true
    compass.engine.optimizer.schedule.period=600
```


``` 
    # com.soa.rollup.configuration.cfg
    monitoring.rollup.configuration.countersForEachRun= 0
```

It is recommended that all rollups are disabled.  The rollups tables should be partitioned using database scripts.  
Include the following properties to disable the rollups.
``` 
    # com.soa.rollup.delete.old.cfg
    monitoring.delete.rollup.MO_ROLLUP15.enable=true
    monitoring.delete.rollup.MO_ROLLUPDATA.enable=true
    monitoring.delete.rollup.MO_ROLLUP_DAY.enable=true
    monitoring.delete.rollup.MO_ROLLUP_HOUR.enable=true
    monitoring.delete.rollup.MO_ROLL_ORG15.enable=true
    monitoring.delete.rollup.MO_ROLL_ORG_D.enable=true
    monitoring.delete.rollup.MO_ROLL_ORG_H.enable=true
    monitoring.delete.usage.enable=true
```

Enable only the valid protocols that will be accepted.  Add the following property to the container property file.
``` 
    # com.soa.http.client.core.cfg 'SSLv3,TLSv1,TLSv1.1,TLSv1.2'
    https.socket.factory.enabledProtocols=
```

Set the search index.
``` 
    # com.soa.search.cfg
    com.soa.search.index.merge.maxSegmentSize=10000000
```

Configure the API Portal (CM) properties.
``` 
    # com.soa.atmosphere.console.cfg CM only
    security.config.basicAuth=false
    security.config.realm=atmosphere.soa.com
    atmosphere.console.config.userDefinedScriptVersion=
    atmosphere.default.policies=
```

Configure the log4j appender and location.  If no appender is provided, it will default to `org.apache.log4j.RollingFileAppender`.  The location should be the directory that all logs will be sent too.
```
	# com.soa.log
	log4j.appender=
	log4j.location=
```

When configuring email groups to send alerts too.
```
    # com.soa.framework
    email.sender=
```

When configuring a Policy or Community Manager containers, it is <span style="color:red">*required</span> to include `audit.maxContentSize`.  

```
    # com.soa.policy.handler.audit
    audit.maxContentSize=
```

```
    # com.soa.admin.console 
    admin.console.domain.enabled=
```

### Deployment Zone configuration
Deployment Zones are automatically configured when either creating a new cluster or a new ND is registered and NOT added 
into an existing cluster.
New properties are introduced and only required for ND containers:

```
    # Required when ND needs to invoke CM provided APIs.  Provide CM address only if CM is not deployed with PM.
    cm.address=
    cm.admin.user=
    cm.admin.password=
    nd.location=
    cluster.location=
```

The location fields contain the GPS location of the datacenter that the containers belong too.  So, if the datacenter existed in LA, the value would be `34.0522,-118.2437`.

The CM admin fields contain information on being able to invoke CM specific APIs.  For the CM address, it is NOT required to include the 
context root used to reach the portal.

#### Tenant Creation
Automation scripts have the ability to create one (1) to many new tenants or add new themes to existing tenants.  This is accomplished by
 including the following JSON object in the property file as a string.  The property `tenant.create` will then need to be set to true.

For every array element under the tenants attribute will be used to create a new tenant will be created.

For every array element unter the themes, inside of the tenants array, a new theme will be added for the tenant was created.  This 
shoulc only be used for extra themes that need to be added, beyone the initial theme that was created at time of tenant creation.

The deployment zone array is to add deployment zones to the created tenant.  Each array element will add a new deployment zone.

```
    #TenantProperties
    tenant.create=false
    #{
    #   'contextRoot': '/mdn', \
    #  	'userRolesDenied': '', \
    #	'tenants': [{\
    #       'contactEmailAddress': 'no-reply@open', \
    #  		'virtualHosts': 'localhost,enord-macbook-pro.local,monsanto.akana.local', \
    #  		'address': 'https://enord-macbook-pro.local:19910', \
    #  		'url': 'https://enord-macbook-pro.local:19910', \
    #  		'name': 'Monsanto Developer Network', \
    #  		'theme': 'default', \
    #  		'id': 'mdn', \
    #  		'themeimpl': 'default', \
    #  		'fromEmailAddress': 'no-reply@open', \
    #  		'consoleAddress': 'https://enord-macbook-pro.local:19910/mdn', \
    #  		'adminEmail': 'admin@open', \
    #  		'adminPassword': 'password'\
    #       "deploymentzones": [{\
    #           "name": "apigateway"\
    #       }]\
    #  	}], \
    #}
    portal.definition=
```

The older properties are still supported when creating a single tenant.  Using this will only allow you to create a single tenant and not 
add extra themes.  When using this method, you are warned with the following warning `Consider migrating to using the tenants object, 
which supports multiple tenants and themes`.

```
    #TenantProperties
    # CM specific properties
    atmosphere.context.root=/mdn
    # users configured in community manager
    atmosphere.config.userRolesDenied=
    tenant.url=https://enord-macbook-pro.local:19910
    tenant.name=Monsanto Developer Network
    tenant.id=mdn
    tenant.address=https://enord-macbook-pro.local:19910
    tenant.console.address=https://enord-macbook-pro.local:19910/mdn
    tenant.theme=default
    tenant.themeimpl=default
    tenant.admin.email=admin@open
    tenant.admin.password=password
    tenant.contact.email.address=no-reply@open
    tenant.from.email.address=no-reply@open
    tenant.virtual.hosts=localhost,enord-macbook-pro.local,monsanto.akana.local
    # Added 7.2.8
    tenant.create=true
```

#### Hardening Tasks
These tasks are the implementation of the [Hardening 2.0](http://docs.akana.com/sp/platform-hardening_2.0.html) recommendations.

During hardening it is recommended to run the admin console on a port different than the actual containers are listening
on.  The following properties are used to move the admin console onto a different port.  The admin console can also be
configured to listen only on the localhost interface.  To configure the admin console to use basic auth, configure
the basic auth option to be true.

```
	container.admin.port=8900
    container.admin.console.localhost.only=false
    container.admin.console.restricted=false
    container.admin.console.basicauth.enabled=true
```

#### Performance Tasks
These tasks are the implementation of the [Performance](http://docs.akana.com/sp/performance-tuning.html) recommendations.

com.soa.client.subsystems

| Property | Setting | Notes |
|----------|---------|-------|
| pm.client.cache.cacheExpirationSecs | 14400 (4 hours) | Expiration time for cached authentication information (default is five minutes) |
| pm.client.cache.refresh.trigger.repeatInterval | 300000 (5 minutes) | Refresh interval for cached authentication information (default is one minute) |

```
    # com.soa.client.subsystem
    pm.client.cache.cacheExpirationSecs=14400
    pm.client.cache.refresh.trigger.repeatInterval=300000
```

com.soa.saml

| Property | Setting | Notes |
|----------|---------|-------|
| com.soa.saml.assertion.expiration | 240 (default) | SAML Assertion expiration time (default is four hours) |

```
    # com.soa.saml
    com.soa.saml.assertion.expiration=240
```

com.soa.auz.client

| Property | Setting | Notes |
|--|--|--|
| cached.auz.decision.service.cacheTimeout | 300 (5 minutes) | Refresh interval for cached authorization decisions (default is one minute) |
| cached.auz.decision.service.expirationTimeInSeconds | 14400 (4 hours) | Expiration time for cached authorization decisions (default is 30 minutes) |


```
    # com.soa.auz.client (ND containers only)
    cached.auz.decision.service.cacheTimeout=300
    cached.auz.decision.service.expirationTimeInSeconds=14400
```

com.soa.container.configuration.service

| Property | Setting | Notes |
|--|--|--|
| container.refresh.trigger.repeatInterval | 120000 (2 minutes) | Interval for checking for changes to container configuration (default is 15 seconds) |

```
    # com.soa.container.configuration.service
    container.refresh.trigger.repeatInterval=120000
```    
   
com.soa.mp.core

| Property | Setting | Notes |
|--|--|--|
| rules.expiration.trigger.repeatInterval | 60000 (1 minute) |Interval between checking of the expiration of a Denial of Service (DoS) rule action expiration (default is one second) |
``` 
    # com.soa.mp.core
    rules.expiration.trigger.repeatInterval=60000
```    

#### Container Features
Install the proper features.  Example property files can be located in the exampleFiles directory within the properties directory.

* [Standalone PM Container](com.soa.pso.automation.jython/scripts/automation/properties/exampleFiles/Standalone_PM.properties?api=v2)
    * policy.manager.console
    * policy.manager.services
    * security.services
    * mongo.db (if using mongodb for analytical data)
* [PM with CM](com.soa.pso.automation.jython/scripts/automation/properties/exampleFiles/PM_with_CM.properties?api=v2)
    * Install Standalone PM
    * community.manager
    * community.manager.default.theme
    * community.manager.scheduled.jobs
    * community.manager.simple.developer.theme (If using SimpleDev)
    * community.manager.hermosa.theme (if using the Hermosa theme, 8.2 feature)
* [PM with CM and OAuth](com.soa.pso.automation.jython/scripts/automation/properties/exampleFiles/PM_with_CM_and_OAuth.properties?api=v2)
    * Install PM with CM
    * community.manager.oauth.provider
    * oauth.provider
* [PM with remote CM](com.soa.pso.automation.jython/scripts/automation/properties/exampleFiles/PM_with_remote_CM.properties?api=v2)
    * Install Standalone PM
    * community.manager.scheduled.jobs
    * community.manager.plugin
    * community.manager.policy.console
* [Standalone CM](com.soa.pso.automation.jython/scripts/automation/properties/exampleFilesStandalone_CM.properties)
    * community.manager.apis
    * community.manager.default.theme
    * community.manager.simple.developer.theme (If using SimpleDev)
    * community.manager.hermosa.theme (if using the Hermosa theme, 8.2 feature)
* [Standalone CM with OAuth](com.soa.pso.automation.jython/scripts/automation/properties/exampleFiles/Standalone_CM_with_OAuth.properties?api=v2)
    * Install Standalone CM
    * community.manager.oauth.provider
    * oauth.provider
* [Standalone ND](com.soa.pso.automation.jython/scripts/automation/properties/exampleFiles/Standalone_ND.properties?api=v2)
    * network.director
    * api.security.policy.handler
* Standalone ND with OAuth
    * Install Standalone ND
    * community.manager.oauth.provider.agent
    * oauth.provider.agent
    * [TODO] Default property file
* [Standalone OAuth](com.soa.pso.automation.jython/scripts/automation/properties/exampleFiles/Standalone_OAuth.properties?api=v2)
    * community.manager.oauth.provider
    * oauth.provider
    * community.manager.plugin
+ PingFederate Support
    * For CM and ND
        - ping.federate.integration
+ LaaS Support
    * For CM nodes only
        - community.manager.laas
        
+ Envision Support
    * envision=true
    * envision.metrics.collector
    * envision.policy.manager.console.extensions
    * envision.policy.manager.service.extensions=false
    * envision.policy.manager.analytics.security.provider=false
    * envision.sample.demo.charts
    
* Add Monitoring to any container
    * admin.monitoring.tool
+ Optional Features
    * Site Minder
        - sitemider
        - sitemider
    * SAML WebSSO
        - saml2.sso
        - saml2.sso.ui
    * Development Services
        - devservices
    * Policy Manager for IBM WebSphere DataPower
        - pm.custom.policy
        - pm.websphere.mq
        - pmdp
        - pmdp.slave.node
        - pmdp.console.policy
        - pmdp.malicious.pattern
        - pmdp.oauth
        - pmdp.schema.update
    * Integration Services - @deprecated in version 8.2
    	- integration.services
    * Freemarker
    	- freemarker.activity
    * Header Activity
    	- header.activity
    * Normalize
    	- normalize.activity
    	
##### Custom Features

Custom features that are created for a specific client can be installed when using automation.  This is a comma separated field that contains the namespace of the feature that needs to be installed.

```
    # Custom Features
    custom.features=
```

To install the Endpoint selector and the API Hook features you would include the following; `custom.features=com.akana.pso.endpointselector.version,com.akana.pso.apihooks.extensions`.

NOTE: Automation will not complete any extra configuration tasks, like installing or updating schema tasks.  These tasks will need to be completed manually.

##### Custom Properties

Additional properties can be added into any category.  These are useful when a category, that doesn't exist out of the box, needs to be added to any configuration category.  There will be no field validation when adding properties in this manner.

These properties are added by including the following property in any container property file:

```
    # Custom Properties to be added into any configuration category.
    custom.properties=
    #custom.properties={ \
    #	"pids": [{ \
    #  	    "pid": "<name of pid, like com.soa.log>", \
    #  	    "properties": [{\
    #  		    "property": "name of property, like log4j.appender.SYSLOG>", \
    #  		    "value": "<value of property to be set"
    #	    }]\
    #  	}] \
    #}
```

If it was required to add SYSLOG into the `com.soa.log` category, the property would look like:

```
    custom.properties={ \
    	"pids": [{ \
      	    "pid": "com.soa.log", \
      	    "properties": [{ \
      		    "property": "log4j.appender.SYSLOG", \
      		    "value": "org.apache.log4j.net.SyslogAppender" \
    	    },{ \
                "property": "log4j.appender.syslog.FacilityPrinting", \
      		    "value": "true" \
            },{ \
                "property": "log4j.appender.SYSLOG.Header", \
      		    "value": "true" \
            },{ \
                "property": "log4j.appender.SYSLOG.syslogHost", \
      		    "value": "$rsyslog_host" \
            },{ \
                "property": "log4j.appender.SYSLOG.facility", \
      		    "value": "$syslog_facility" \
            },{ \
                "property": "log4j.appender.SYSLOG.layout", \
      		    "value": "org.apache.log4j.PatternLayout" \
            },{ \
                "property": "log4j.appender.SYSLOG.layout.conversionPattern", \
      		    "value": "%d %-5p [%t] %c{1} - %m%n" \
            }] \
      	}] \
    }
```
        
#### Property File

```
    #CommonProperties
    container.name=pm
    container.key=
    # this is used for the hostname unless the scripts pass in '--hostname'
    container.host=0.0.0.0
    container.port=9900
    container.admin.port=8900
    container.admin.user=administrator
    container.admin.password=password
    container.passwords.encrypted=false
    container.admin.console.localhost.only=false
    container.admin.console.restricted=false
    container.admin.console.basicauth.enabled=true
    # Customize the container default listener settings.  This is only conducted if values exist, otherwise defualts are used.
    container.listener.minimum=
    container.listener.maximum=
    container.listener.idleTimeout=
    container.listener.pki.alias=
    container.listener.pki.alias.password=
    container.secure=false
    # The certificates that will be used for container identity, if the default ones are not acceptable
    container.secure.keystore=
    container.secure.storepass=
    container.secure.alias=
    container.secure.alias.password=
    # The trusted certificates that need to be added into this containers cacerts
    container.secure.trusted.keystore=
    container.secure.trusted.storepass=
    
    # FeaturesSection
    ## Policy Manager
    managed.services=false
    policy.manager.console=true
    policy.manager.services=true
    scheduled.jobs=false
    security.services=false
    
    ## Network Directory
    network.director=false
    community.manager.oauth.provider.agent=false
    oauth.provider.agent=false
    
    ## Community Manager
    community.manager=false
    community.manager.apis=false
    community.manager.oauth.provider=false
    community.manager.scheduled.jobs=false
    oauth.provider=false
    ## 8.0 features
    elastic.search=false
    grant.provisioning.ui=false
    
    ## Miscellaneous
    agent.foundation=false
    delegate=false
    delegate.access.point=false
    ping.support=false
    tomcat.agent=false
    
    ## Envision
    envision=false
    envision.metrics.collector=false
    envision.policy.manager.console.extensions=false
    envision.policy.manager.service.extensions=false
    envision.policy.manager.analytics.security.provider=false
    envision.sample.demo.charts=false
    
    ## Lifecycle Manager
    lifecycle.manager=false
    
    # PluginSection
    api.security.policy.handler=false
    cluster.support=false
    community.manager.plugin=true
    community.manager.policy.console=true
    external.keystore.feature=false
    kerberos.impersonation=false
    community.manager.laas=false
    community.manager.laas.schedule.jobs=false
    ping.federate.integration=false
    mongo.db=false
    ## 8.2 features
    community.manager.hermosa.theme=false
    community.manager.default.theme=false
    community.manager.simple.developer.theme=false
    api.platform.plugin=false
    elasticsearch.log4j.appender.plugin=false
    
    # ToolSection
    72.upgrade=false
    admin.monitoring.tool=true
    admin.health.tool=true
    80.upgrade=false
    82.upgrade=false
    83.upgrade=false
    
    # OptionPacks
    # include if siteminder is required
    sitemider=false
    siteminder.ui=false
    siteminder.path=
    # include is configuring SAML authentication
    saml2.sso=false
    saml2.sso.ui=false
    # include for Development Services
    devservices=false
    # PMDP Features
    pm.custom.policy=false
    pm.websphere.mq=false
    pmdp=false
    pmdp.slave.node=false
    pmdp.console.policy=false
    pmdp.malicious.pattern=false
    pmdp.oauth=false
    pmdp.schema.update=false
    # Integration Services
    ## @deprecated in version 8.2
    integration.services=false
    # Freemarker
    freemaker.activity=false
    # Header
    header.activity=false
    # Normalize
    normalize.activity=false
    
    # Custom Features
    custom.features=
    
    #ConfigurationFiles
    database.configure=true
    proxy.filename=
    # used to route containers through load balancer when needed
    # Format needs to be the following 'com.soa.http.route-pm1.cfg;http://pm.host.com:9900/*;http://lb.host.com'
    # Needed when routing requests back through a load balance: https://support.soa.com/support/index.php?_m=knowledgebase&_a=viewarticle&kbarticleid=607
    route.definitions=
    
    # ND specific properties
    # just the address to pm like http://<hostname>:<port>
    wsmex.address=
    # Used in multiple datacenter architecture, so ND registers against the master database.
    pm.master.address=
    # if the PM admin console is running on a different port, than wsmex please provide the address to the PM admin console.  'http://<hostname>:<port>
    pm.admin.console=
    # if the PM admin access is different from this container, set the proper values here
    pm.admin.user=
    pm.admin.password=
    # If Basic Auth has been disabled for the configjob, set configjob.secured to false
    pm.admin.basicauth=
    # Required when ND needs to invoke CM provided APIs.  Provide CM address only if CM is not deployed with PM.
    cm.address=
    cm.admin.user=
    cm.admin.password=
    # Register ND to PM
    register.nd=true
    # all required listeners to be created for nd.  This is a comma seperated field that consistes of at least 1 entries 'listener_name:hostname:port:protocol:idleTimeout:poolMax:poolMin:bind:alias'.
    # if ND is secured, automation needs to add an endpoint to the listener.  The automation will use the 'container.secure.keystore' to search from the proper certificate for each listener
    nd.listener=
    # Used to set the location for this container that is being created
    nd.location=
    # org needs to be a valid uddi key (Change if container needs to be in a different organization)
    # Change if ND is required to be under a different organization
    org=uddi:soa.com:registryorganization
    # Name of the cluster to add the ND container into
    cluster=
    # all required listeners to be created for the cluster, if the cluster doesn't exist.  This is a comma seperated field that consistes of at least 1 entries 'listener_name:hostname:port:protocol:idleTimeout:poolMax:poolMin:bind'
    cluster.listener=
    # Used when creating a new cluster to set the location of the cluster
    cluster.location=
    
    # disable the remote usage writer in ND containers
    # com.soa.monitor.usage
    remote.writer.enabled=true
    
    # com.soa.platform.jetty.cfg
    jetty.information.servlet.enable=false
    
    # com.soa.http.client.core.cfg ND only
    http.client.params.handleRedirects=true
    
    # com.soa.binding.http.cfg ND only
    http.in.binding.virtualhost.endpoint.selection.enabled=false
    
    # com.soa.binding.soap.cfg ND only
    soap.in.binding.virtualhost.endpoint.selection.enabled=false
    soap.in.binding.component.supportGetWsdl=true
    soap.out.binding.component.checkForNon500Faults=false
    
    # com.soa.compass.settings.cfg
    compass.engine.optimizer.schedule=true
    compass.engine.optimizer.schedule.period=600
    
    # com.soa.rollup.configuration.cfg
    monitoring.rollup.configuration.countersForEachRun= 0
    
    # com.soa.rollup.delete.old.cfg
    monitoring.delete.rollup.MO_ROLLUP15.enable=false
    monitoring.delete.rollup.MO_ROLLUPDATA.enable=false
    monitoring.delete.rollup.MO_ROLLUP_DAY.enable=false
    monitoring.delete.rollup.MO_ROLLUP_HOUR.enable=false
    monitoring.delete.rollup.MO_ROLL_ORG15.enable=false
    monitoring.delete.rollup.MO_ROLL_ORG_D.enable=false
    monitoring.delete.rollup.MO_ROLL_ORG_H.enable=false
    monitoring.delete.usage.enable=false
    
    # com.soa.http.client.core.cfg 'SSLv3,TLSv1,TLSv1.1,TLSv1.2'
    https.socket.factory.enabledProtocols=
    
    # com.soa.search.cfg
    com.soa.search.index.merge.maxSegmentSize=10000000
    
    # com.soa.atmosphere.console.cfg CM only
    security.config.basicAuth=false
    security.config.realm=atmosphere.soa.com
    atmosphere.console.config.userDefinedScriptVersion=
    atmosphere.default.policies=
    
    # com.soa.log
    log4j.appender=
    log4j.location=
    
    # com.soa.framework
    email.sender=
    
    # com.soa.policy.handler.audit
    audit.maxContentSize=10000000
    
    # com.soa.admin.console
    admin.console.domain.enabled=
    
    # grid cache true or false
    grid.cache=false
    
    #TenantProperties
    tenant.create=false
    #portal.definition={
    #	"contextRoot": "/devporal", \
    #  	"userRolesDenied": "", \
    #  	"tenants": [{\
    #  		"contactEmailAddress": "no-reply@open", \
    #  		"virtualHosts": "localhost", \
    #  		"address": "https://localhost:19910", \
    #  		"url": "https://localhost:19910", \
    #  		"name": "Automation Developer Network", \
    #  		"theme": "hermosa", \
    #  		"id": "devportal", \
    #  		"themeimpl": "default", \
    #  		"fromEmailAddress": "no-reply@open", \
    #  		"consoleAddress": "https://localhost:19910/devportal", \
    #  		"adminEmail": "admin@open", \
    #  		"adminPassword": "password"\
    #  	}] \
    #}
    portal.definition=
    
    #HardeningProperties
    # Hardening properties are set to recommended values.  Change if desired.  For details review: http://docs.akana.com/sp/platform-hardening_2.0.html
    container.harden=true
    # All Containers
    # com.soa.http.client.core
    ## http.client.params.cookiePolicy
    harden.ignoreCookies=ignoreCookies
    
    # com.soa.transport.jetty
    ## session.manager.factory.secureCookies
    harden.secureCookies=true
    ## http.incoming.transport.config.enabledProtocols
    harden.enabledProtocols=SSLv2HELLO,TLSv1,TLSv1.1, TLSv1.2
    ## http.incoming.transport.config.cipherSuites
    harden.cipherSuites=SSL_RSA_WITH_RC4_128_MD5,SSL_RSA_WITH_RC4_128_SHA,TLS_RSA_WITH_AES_128_CBC_SHA,TLS_DHE_DSS_WITH_AES_128_CBC_SHA,SSL_RSA_WITH_3DES_EDE_CBC_SHA,SSL_DHE_DSS_WITH_3DES_EDE_CBC_SHA
    
    # Community Manager containers
    # com.soa.atmosphere.forwardproxy
    ## forward.proxy.allowedHosts
    harden.cm.allowed.hosts==<Network Director Host(s) and/or Load Balancer host>
    
    # com.soa.http.client.core
    ## block.headers.interceptor.blocked
    harden.cm.interceptor.blocked=content-type,content-length,content-range,content-md5,host,expect,keep-alive,connection,transfer-encoding
    ## header.formatter.interceptor.templates
    harden.cm.template=
    
    # com.soa.api.security
    ## com.soa.api.security.cache.expirationPeriod
    harden.cache.expirationPeriod=3600000
    ## com.soa.api.security.cache.refreshTime
    harden.cache.refreshTime=300000
    
    # Network Directory containers
    # com.soa.http.client.core
    ## block.headers.interceptor.blocked
    harden.nd.interceptor.blocked=content-type,content-length,content-range,content-md5,host,expect,keep-alive,connection,transfer-encoding,atmo-forward-to,atmo-forwarded-from
    ## header.formatter.interceptor.templates
    harden.nd.template=replace=X-Forwarded-Host:{host}
    harden.nd.replace.host={host}
    
    # com.soa.api.security
    ## com.soa.api.security.cache.expirationPeriod
    harden.nd.security.expiration.period=3600000
    ## com.soa.api.security.cache.refreshTime
    harden.nd.security.refresh.time=300000
    
    # Policy and Community Manager containers
    # com.soa.console.csrf
    ## org.owasp.csrfguard.Enabled
    harden.cm.csrf.enabled=true
    
    # com.soa.console.xss
    ## exceptionURLs
    harden.cm.exception.urls=#COMMA DELIMITED LIST]
    ## keywords
    harden.cm.keywords=#COMMA DELIMITED LIST]
    ## validate
    harden.cm.validate=#true|false]
    
    # com.soa.atmosphere.console
    ## atmosphere.console.config.xFrameOptions (CM)
    ## xFrameOptions (PM)
    harden.cm.x.frame=#DESIRED HEADER]
    
    #PerformanceProperties
    # Performance properties need to be set appropriately for your desired results.  Values currently set are for examples only.
    #    For details review: http://docs.akana.com/sp/performance-tuning.html
    container.performance=true
    # All Containers
    # com.soa.framework
    ## failure.data.capture.enabled
    performance.failureDataCaptureEnabled=true
    track.txBlockThresholdTime=false
    txBlockThresholdTime=0
    
    # com.soa.client.subsystem
    pm.client.cache.cacheExpirationSecs=14400
    pm.client.cache.refresh.trigger.repeatInterval=300000
    
    # com.soa.saml
    com.soa.saml.assertion.expiration=240
    
    # Network Director Containers
    # com.soa.http.client.core
    ## http.connection.manager.maxTotal
    performance.connection.maxTotal=2000
    ## http.connection.manager.defaultMaxPerRoute
    performance.connection.defaultMaxPerRoute=1500
    
    # com.soa.monitor.usage
    ## usage.queue.capacity
    performance.queueCapacity=10000
    
    #com.soa.monitor.usage
    ## usage.batch.writer.usageBatchSize
    performance.usageBatchSize=50
    
    # com.soa.monitor.usage
    ## usage.batch.writer.writeInterval
    performance.writeInterval=1000
    
    # com.soa.vs.engine
    ## vs.capability.metadata.preloadInvokedServices
    performance.preloadInvokedServices=true
    
    # com.soa.contract.enforcement
    ## contract.handler.framework.idleExpiration
    performance.framework.idleExpiration=259200
    ## contract.handler.framework.maxRefreshInterval
    performance.framework.makeFreshInterval=900
    contract.refresh.trigger.repeatInterval=300000
    
    # com.soa.jbi
    ## lbha.endpoint.refresh.task.allowRemoval
    performance.endpoint.allowRemoval=false
    ## lbha.endpoint.refresh.task.expirationInterval
    performance.endpoint.expirationInterval=3600000
    ## lbha.endpoint.refresh.task.maxrefreshInterval
    performance.endpoint.maxrefreshInterval=900000
    
    # com.soa.auz.client (ND containers only)
    cached.auz.decision.service.cacheTimeout=300
    cached.auz.decision.service.expirationTimeInSeconds=14400
    
    # com.soa.container.configuration.service
    container.refresh.trigger.repeatInterval=120000
    
    # com.soa.mp.core
    rules.expiration.trigger.repeatInterval=60000
    
    # Policy Manager Containers
    # com.soa.service.category
    ## service.category.manager.transactional.loadGifMetrics
    performance.loadGifMetrics=false
    
    # com.soa.console
    ## workbench.search.PerformAutoSearch
    performance.performAutoSearch=true
    
    # com.soa.metrics
    ## metrics.rollup.reporter.requireMetricsPolicy
    performance.requireMetricsPolicy=true
    
    # com.soa.auz.operation (PM containers only)
    cached.auz.engine.operation.cacheTimeout=300
    cached.auz.engine.operation.expirationTimeInSeconds=14400
    
    # Custom Properties to be added into any configuration category.
    custom.properties=
    #custom.properties={ \
    #	"pids": [{ \
    #  	    "pid": "<name of pid, like com.soa.log>", \
    #  	    "properties": [{\
    #  		    "property": "name of property, like log4j.appender.SYSLOG>", \
    #  		    "value": "<value of property to be set"
    #	    }]\
    #  	}] \
    #}
    
    # com.soa.external.keystore
    com.soa.keystore.external.encrypted=
    com.soa.keystore.external.keyStoreType=
    com.soa.keystore.external.location=
    com.soa.keystore.external.password=
    com.soa.keystore.external.providerName=
```

## Copyright
Copyright &copy; 2016 Akana, Inc. All Rights Reserved.

## Trademarks
All product and company names herein may be trademarks of their registered owners.
Akana, SOA Software, Community Manager, API Gateway, Lifecycle Manager, OAuth Server, Policy Manager, and Cloud 
Integration Gateway are trademarks of Akana, Inc.

## Akana, Inc.
Akana, Inc.
12100 Wilshire Blvd, Suite 1800
Los Angeles, CA 90025
(866) SOA-9876
www.akana.com
info@akana.com

## Disclaimer
The information provided in this document is provided “AS IS” WITHOUT ANY WARRANTIES OF ANY KIND INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT OF INTELLECTUAL PROPERTY. Akana may make changes to this document at any time without notice. All comparisons, functionalities and measures as related to similar products and services offered by other vendors are based on Akana’s internal assessment and/or publicly available information of Akana and other vendor product features, unless otherwise specifically stated. Reliance by you on these assessments / comparative assessments is to be made solely on your own discretion and at your own risk. The content of this document may be out of date, and Akana makes no commitment to update this content. This document may refer to products, programs or services that are not available in your country. Consult your local Akana business contact for information regarding the products, programs and services that may be available to you. Applicable law may not allow the exclusion of implied warranties, so the above exclusion may not apply to you.

## License
Copyright 2015 Akana, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
