![Installer](images/roguewave.png)

# Akana Automated Software Deployment

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
* run `./installer.py -i -s -c > createContainers.log`

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
* `--postinstallscript` DBscript if any extra dbscripts need to be ran, after container installation
* `--custompolicies` Custom Policies to deploy to the deploy directory.
* `--javaHome` Location of the JRE
* `--environmentproperties` Location of environment properties file. This overwrites the default environment.properties file. You are still required to have the word `environment` in the property file.  This prevents it from being picked up as a container property file.

To delete the container:
* typical usage - `./installer.py -d --key <container key> --host <address to the PM server> --administrator <administrator user> --password <user password> --installpath <installation path>`
* using `--name` - `./installer.py -d --name <container name> --host <address to the PM server> --administrator <administrator user> --password <user password> --installpath <installation path>`
* If running the delete option with a JRE that is external to the install directory, provide the `--javaHome` flag - `./installer.py -d --name <container name> --host <address to the PM server> --administrator <administrator user> --password <user password> --installpath <installation path> --javaHome <absolute path to JRE>`

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
* `--postinstallscript` DBscript if any extra dbscripts need to be ran, after container installation
* `--custompolicies` Custom Policies to deploy to the deploy directory.

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

### HSM (External Keystore)



### stdout log location

The containers stdout can be changed to a custom location by including `std.log.location` property in the installer.properties
file.  The script will update the startup.sh to this location.

**Note:  This potentially code effect how many containers can be created on this installation.  If the location is set to
an absolute path, like `/var/www/akana/mycontainer.log`, this is where all containers would write too.  If the location
stays relative to the container, like `log/mycontainer.log`, multiple containers will continue to write to its appropriate
local log directory.

## Property Files

### Password Encryption
Passwords can be encrypted prior to storing them in any of the property files.  When passwords are encrypted the property `container.passwords.encrypted` needs to be set to true.

The following steps are required to run the password encrypt utility.

1. From the automation zip archive, extract the ps-encryption archive file.
2. cd into the nodeLib directory.
3. npm install
4. npm install java
5. node index.js <text to be encrypted>

The scripts will encrypt all plain text passwords that are included in the property files after building the container.  
At completion of the container build, the script will update all passwords to be encrypted and set `container.passwords.encrypted`
to `true`.

### Installer Property File

```properties
    #InstallSection
    # install.path and resources.location must be absolute
    install.path=/opt/akana_sw/
    resources.location=/opt/akana_sw/stage/resources/
    features=akana-platform-8.2.4.zip,akana-api-platform-8.2.56.zip
    jce.location=
    ncipher.location=
    stdout.log.location=
```

if installing multiple feature packs, the features properties would look like:

```
	features=akana-platform-8.1.39.zip,akana-pm-8.0.115.zip,akana-apiportal-8.0.0.291.zip,com.akana.devservices_8.0.0.zip,com.akana.integration.services_8.0.189684.zip,com.akana.activity.freemarker_8.0.0.zip,com.akana.activity.headers_8.0.0.zip,com.akana.activity.normalize_8.0.0.zip,com.soa.security.provider.siteminder_8.0.189684.zip,PolicyManagerForDataPower_8.0.0.zip
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

```properties
    #Mongo DB Configuration
    mongodb.thread=20
    mongodb.enabled=false
    mongodb.host=
    mongodb.port=
    mongodb.password=
    mongodb.username=
    mongo.authSource=
    mongo.authMechanism=
    mongo.databasename=
    mongo.connect.timeout=
    mongo.socket.timeout=
    mongo.min.poolSize=
    mongo.max.poolSize=
    mongo.wait.queue=
    mongo.wait.queue.timeout=
```

Use `mongodb.username` and `mongodb.password` after setting the user access role on each database (authorization).

Use `mongo.authSource` and `mongo.authMechanism` if [authentication](https://docs.mongodb.com/v3.2/core/authentication) is enabled.

#### Property File

```properties
    #InstallSection
    install.path=/opt/akana_sw/

    #DatabaseSection
    database.create=false
    # if database create and the database already exist, what should we do
    database.recreate=false
    # Should the scripts run any needed dbscripts
    database.run.dbscripts=true
    # Check the required schemas
    database.pm=true
    database.cm=true
    database.oauth=true
    database.laas=false
    database.upgrade52=false
    database.pmdp=false
    database.wcf=false
    database.ims=false
    database.websso=false
    #   Specify the configuration values for this database
    #       key       |restrict | description         
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
    database.jar=<required database jar file>
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
    mongo.authSource=
    mongo.authMechanism=
    mongo.databasename=
    mongo.connect.timeout=
    mongo.socket.timeout=
    mongo.min.poolSize=
    mongo.max.poolSize=
    mongo.wait.queue=
    mongo.wait.queue.timeout=
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
In the container property file, all route files are defined in a the property `route.definitions=`.  An example of an ND routing back through a clustered PM.  The property is configured like `filename;pattern;url`, each route file definition would be seperated by a comma.  Route files can also be added with providing the --deployFiles command switch.

Managing cluster support.  Automation will automatically register an ND container into a Cluster that is created in PM.  If a cluster name is provided and the cluster doesn't exist, the cluster will first be created.  Once the cluster is
created, the new ND container is then added into this cluster.

Container location is used when adding a cluster or gateway container is added as a deployment zone inside the API Portal.  This needs to
 be a GPS location of the cluster or container.  This field needs to look something like ``.  These fields need to be set based on the
 location you want to set.
```properties
    # Used to set the location for this container that is being created
    nd.location=
    # Used when creating a new cluster to set the location of the cluster
    cluster.location=
```

Listeners can be created for all containers.  If the `listener` property is provided, all default listeners are removed
and the listener(s) defined in this property are created.  The following in the format of creating listeners:
```json
    listener={\
        'Endpoints':[{\
            'name':'default-https',\
            'bindtoall':'true',\
            'protocol':'https',\
            'host':'apiplatform.akana.local',\
            'port':'9900',\
            'minimumThreadPool':5,\
            'maximumThreadPool':500,\
            'idleThreadTimeout':1800000,\
            'alias':'apiplatform.akana.local',\
            'aliasPassword':'changeit'\
        }]\
    }
```

Outbound X509 can be set on the listener with following properties:
```properties
outbound.listener={\
  'alias':<name of alias in keystore>,\
  'password':<password of alias, defaults to keystore password>\
}
```


**NOTE: Listener creation using a string is deprecated for containers, but is still supported.

~~Listeners can be created for both ND and clusters.  By default, ND will automatically have a listener for the default interface and port that the container was built to listen on.  For additional required listeners, ND listeners are
populated with `nd.listener=` and cluster listeners are populated in `cluster.listener=`.  Both of these fields are
comma seperated fields.  Within each of these fields they are separated by a `:`, so to create a default http listener
it would look like `default_http0:hostname:9905:http:idleTimeout:poolMax:poolMin:bind:alias:aliasPassword`.  The alias
and alias password properties are only required if an https listener is being created.~~

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

** Note: Deprecated use the listener property below

~~Default container listener can be customized by providing the `container.listener.minimum`, `container.listener.maximum` amd `container.listener.idleTimeout`.  These fields will be used to update the default listener that is created when building a container.  This is mostly recommended for the Policy Manager and Community Manager containers.~~

~~If the default container listener is secured, the container identity cert will be used as the PKI.  This PKI can be updated when the container is created.  By including the property `container.listener.pki.alias`, the automation scripts will add this key to the default listener.  If this key has a different password then the keystore, the property `container.listener.pki.alias.password` needs to be supplied.  The keystore, `container.secure.keystore`, must include both the key and the certificate.~~

IBM MQ listeners is supported by including the appropriate feature jar file, 'com.soa.com.ibm.mq.merged-<version>.jar'.  
The feature is then isstalled by including:
```properties
    mq.support=true
```

`--deployFiles` command line option is used to add extra files into a container deploy directory.  This is a final step
that occurs.  This can be used for any custom policies or route file definitions.

`--custompolicies` command line option is used to extract any custom policy jar file into the /deploy directory after
the container is created and configured.

#### Configure Container Properties
Deploy files can be set in the container property file.  This is needed when a single installation is hosting multiple containers.  Add the following property to the required container property file:
```properties
container.deploy.files=
```

Custom Policies can be set in the container property file.  This needs to be an absolute path to an archive file that contains all custom policies/features.  This is needed when a single installation is hosting multiple containers.  Add the following property to the required container property file:
```properties
container.custom.policies=
```

Support for Windows deployments to update any JVM options.  Add the following:
```properties
--javaopts "-Xmx4096M"
```

When ND is writing any analytical data through PM, the remote writer needs to be enabled.  The following property needs to be added into the ND container property file.
```properties
	# disable the remote usage writer in ND containers
    remote.writer.enabled=true
```

To view all services that are deployed into any container, the jetty information servlet needs to be enabled.
```properties
    # com.soa.platform.jetty.cfg
    jetty.information.servlet.enable=true
```

Add the following property if it is required that ND follows all redirects
```properties
    # com.soa.http.client.core.cfg ND only
    http.client.params.handleRedirects=true
```


```properties
    # com.soa.binding.http.cfg ND only
    http.in.binding.virtualhost.endpoint.selection.enabled=false
```

com.soa.binding.soap

| Property | Setting | Notes |
|----------|---------|-------|
| soap.in.binding.virtualhost.endpoint.selection.enabled | false |  |
| soap.in.binding.component.supportGetWsdl | true | Might want to disable this to block WSDL access from Internet |
| soap.out.binding.component.checkForNon500Faults | false | This prevents false XML parsing errors for non-500, non-fault responses |

```properties
    # com.soa.binding.soap.cfg ND only
    soap.in.binding.virtualhost.endpoint.selection.enabled=false
    soap.in.binding.component.supportGetWsdl=true
    soap.out.binding.component.checkForNon500Faults=false
```


```properties
    # com.soa.compass.settings.cfg
    compass.engine.optimizer.schedule=true
    compass.engine.optimizer.schedule.period=600
```


```properties
    # com.soa.rollup.configuration.cfg
    monitoring.rollup.configuration.countersForEachRun= 0
```

It is recommended that all rollups are disabled.  The rollups tables should be partitioned using database scripts.  
Include the following properties to disable the rollups.
```properties
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
```properties
    # com.soa.http.client.core.cfg 'SSLv3,TLSv1,TLSv1.1,TLSv1.2'
    https.socket.factory.enabledProtocols=
```

Set the search index.
```properties
    # com.soa.search.cfg
    com.soa.search.index.merge.maxSegmentSize=10000000
```

Configure the API Portal (CM) properties.
```properties
    # com.soa.atmosphere.console.cfg CM only
    security.config.basicAuth=false
    security.config.realm=atmosphere.soa.com
    atmosphere.console.config.userDefinedScriptVersion=
    atmosphere.default.policies=
```

Configure the log4j appender and location.  If no appender is provided, it will default to `org.apache.log4j.RollingFileAppender`.  The location should be the directory that all logs will be sent too.
```properties
	# com.soa.log
	log4j.appender=
	log4j.location=
```

When configuring email groups to send alerts too.
```properties
    # com.soa.framework
    email.sender=
```

```properties
    # com.soa.policy.handler.audit
    audit.maxContentSize=
```

```properties
    # com.soa.admin.console
    admin.console.domain.enabled=
```



### Deployment Zone configuration
Deployment Zones are automatically configured when either creating a new cluster or a new ND is registered and NOT added into an existing cluster.
New properties are introduced and only required for ND containers:

```properties
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
should only be used for extra themes that need to be added, beyone the initial theme that was created at time of tenant creation.

The deployment zone array is to add deployment zones to the created tenant.  Each array element will add a new deployment zone.

```properties
    #TenantProperties
    tenant.create=false
    portal.definition={
        'contextRoot': '/mdn', \
        'userRolesDenied': '', \
    	'tenants': [{\
           'contactEmailAddress': 'no-reply@open', \
      		'virtualHosts': 'localhost,enord-macbook-pro.local,monsanto.akana.local', \
      		'address': 'https://enord-macbook-pro.local:19910', \
      		'url': 'https://enord-macbook-pro.local:19910', \
      		'name': 'Monsanto Developer Network', \
      		'theme': 'default', \
      		'id': 'mdn', \
      		'themeimpl': 'default', \
      		'fromEmailAddress': 'no-reply@open', \
      		'consoleAddress': 'https://enord-macbook-pro.local:19910/mdn', \
      		'adminEmail': 'admin@open', \
      		'adminPassword': 'password'\
           "deploymentzones": [{\
               "name": "apigateway"\
           }]\
    		"themes": [{\
    			"name": "simpledev",\
    			"virtualhost": "developer-localhost",\
    			"consoleaddress": "https://developer-localhost:19910/devportal",\
    			"themeimpl": "default"
    		}]\
      	}] \
    }
```

The older properties are still supported when creating a single tenant.  Using this will only allow you to create a single tenant and not
add extra themes.  When using this method, you are warned with the following warning `Consider migrating to using the tenants object,
which supports multiple tenants and themes`.

```properties
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

#### ElasticSearch Configuration
ElasticSearch has three configuration settings: `embeddedConfig`, `transportClientConfig`, and `clientOnlyConfig`.
Typical non-production environment will use `embeddedConfig` and `transportClientConfig` is needed for production environment.

Sample `embeddedConfig`:
```properties
elastic.search.configuration = { \
	"shards" : 2, \
	"replicas" : 1, \
	"embeddedConfig" : { \
		"clusterName" : "MyESCluster", \
		"minimumMasterNodes" : 2, \
		"multicastEnabled" : False, \
		"nodeName" : "MyESCluster_node_1", \
		"indexLocation" : "/var/akana/index", \
		"networkBindHost" : "0.0.0.0", \
		"networkPublishHost" : "localhost", \
		"transportPort" : 9300, \
		"httpPort" : 9200, \
		"httpEligible" : False, \
		"masterEligible" : True, \
		"isDataNode" : True \
	} \
}
```

Sample `transportClientConfig`:
```properties
elastic.search.configuration = { \
	"shards" : 2, \
	"replicas" : 1, \
	"transportClientConfig" : { \
		"clusterName" : "MyESCluster", \
		"esServerUrl" : "http://escluster1"
	} \
}
```

Sample `clientOnlyConfig`:
```properties
elastic.search.configuration = { \
	"shards" : 2, \
	"replicas" : 1, \
	"clientOnlyConfig" : { \
		"clusterName" : "MyESCluster", \
		"masterHostUrl" : "http://masterESnode", \
		"multicastEnabled" : False, \
		"nodeName" : "MyESCluster_node_1", \
		"networkBindHost" : "0.0.0.0", \
		"networkPublishHost" : "localhost", \
		"transportPort" : 9300, \
	} \
}
```

Securing Elastic Search server.  Add the following properties to the container property file:
```properties
elastic.client.alias=
elastic.client.aliasPassword=
elastic.client.clientUser=
elastic.client.clientUserPassword=
elastic.client.enableSSL=false
elastic.client.keystorePassword=
elastic.client.keystorePath=
```

Ability to set the elastic search index configuration properties:
```properties
# com.akana.elasticsearch
elastic.config.index.number.of.replicas=
elastic.config.index.number.of.shards=
```

#### Domain Configuration
Domain configuration on CM can be configured with properties file containing `domains` in the file name. Current automation supports configuration of OIDC Relying Party.
OAUTH provider domain can be configured, but only for existing CM deployment as OAUTH domain requires platform identity to be defined ahead of time (cannot be automated).

Sample `demo_domains.properties` which configures Auth0 OIDC Relying Party Domain:

```properties
#
# Environment values
#
demo.rp.domain.name=Auth0 OpenID Connect Relying Party
demo.rp.bridge.appid=4QOVXqgg7DsK4m5MiFfirknxhEt2DX30
demo.rp.bridge.secret=xm3vkTrLLohE38QiReXrrvC8aC7aivt7U8i06wAZSDG9NrV5NBAlVa8WLNIehchh
demo.rp.base.url=https://bkwon.auth0.com

#
# Demo domains
#
demo.domains = [ \
	{ \
		"name" : "%demo.rp.domain.name%", \
		"desc" : "Auth0 OpenID Connect Relying Party", \
		"type" : "DOMAINTYPE_RP", \
		"config" : "demo.rp.config" \
	}]

#
# All domain configuration details follow
#

demo.rp.config = { \
	%demo.rp.page2.cfg.method%, \
	%demo.rp.page3.provider%, \
	%demo.rp.page4.authentication%, \
	%demo.rp.page5.app%, \
	%demo.rp.page6.token%, \
	%demo.rp.page7.user%, \
	"cachedProviderConfig" : "\%demo.rp.part2\%" \
}

demo.rp.page2.cfg.method = \
	"configMethod" : "metadata_edit", \
	"wellknownConfigURL" : "%demo.rp.base.url%/.well-known/openid-configuration"

demo.rp.page3.provider = \
	"issuer" : "%demo.rp.base.url%", \
	"jwksUri" : "%demo.rp.base.url%/.well-known/jwks.json", \
	"endUserClaimsSource" : "userinfo"

demo.rp.page4.authentication = \
	"authorizationEndpoint" : "%demo.rp.base.url%/authorize", \
	"auzEndpointHttpMethod" : "GET", \
	"responseTypeSelected" : "id_token", \
	"responseMode" : "query", \
	"scopesRequired" : [ \
		"{inbound_request_scope}", \
		"openid", \
		"profile"], \
	"useInboundOAuthClientID" : False, \
	"transferInboundOAuthClientRedirectUri" : False, \
	"transferInboundOAuthGrantID" : True, \
	"prompt" : ["login", "consent", "select_account", "delegate"]

demo.rp.page5.app = \
	"appId" : "%demo.rp.bridge.appid%", \
	"isPlatformIdentity" : False, \
	"appSecret" : "%demo.rp.bridge.secret%"

demo.rp.page6.token = \
	"tokenEndpoint" : "%demo.rp.base.url%/oauth/token", \
	"clientAuthenticationMethodSelected" : "client_secret_basic", \
	"JWTValidationConstraints" : { \
		"isSymmetrickeyBase64Encoded" : True \
	}

demo.rp.page7.user = \
	"userinfoEndpoint" : "%demo.rp.base.url%/userinfo", \
	"userinfoEndpointHttpMethod" : "GET", \
	"claimNamesMapping" : { \
		"subjectClaimName" : "sub", \
		"givenNameClaimName" : "given_name", \
		"lastNameClaimName" : "family_name", \
		"emailClaimName" : "email" \
	}

demo.rp.part2 = { \
	"response_types_supported" : [ \
			"code", "code id_token", "code token", "code id_token token", \
			"token", "id_token" ,"id_token token"], \
	"token_endpoint_auth_methods_supported" : [ \
			"client_secret_post", "client_secret_basic", "client_secret_jwt", "private_key_jwt", "none"], \
	"response_modes_supported" : [ \
			"query", "fragment", "form_post"], \
	"grant_types_supported" : [ \
			"authorization_code", "implicit", "password", "client_credentials", \
			"urn :ietf:params:oauth:grant-type:jwt-bearer"], \
	"id_token_signing_alg_values_supported" : [ \
			"HS256", "HS384", "HS512", \
			"RS256", "RS384", "RS512", \
			"ES256", "ES384", "ES512", \
			"PS256", "PS384", "PS512"], \
	"id_token_encryption_alg_values_supported" : [ \
			"RSA1_5", "RSA-OAEP", "RSA-OAEP-256", \
			"A128KW", "A192KW", "A256KW", \
			"A128GCMKW", "A192GCMKW", "A256GCMKW", \
			"dir"], \
	"id_token_encryption_enc_values_supported" : [ \
			"A128CBC-HS256", "A192CBC-HS384", "A256CBC-HS512", \
			"A128GCM", "A192GCM", "A256GCM"], \
	"userinfo_signing_alg_values_supported" : [ \
			"HS256", "HS384", "HS512", \
			"RS256", "RS384", "RS512"], \
	"userinfo_encryption_alg_values_supported" : [ \
			"RSA1_5", "RSA-OAEP", "A128KW", "A256KW"], \
	"userinfo_encryption_enc_values_supported" : [ \
			"RSA1_5", "RSA-OAEP", "A128KW", "A256KW"], \
	"token_endpoint_auth_signing_alg_values_supported" : [ \
			"HS256", "HS384", "HS512", \
			"RS256", "RS384", "RS512"], \
	"selected_response_types_supported" : [], \
	"selected_token_endpoint_auth_methods_supported" : [], \
	"selected_response_modes_supported" : [], \
	"selected_grant_types_supported" : [], \
	"selected_id_token_signing_alg_values_supported" : [],  \
	"selected_id_token_encryption_alg_values_supported" : [], \
	"selected_id_token_encryption_enc_values_supported" : [], \
	"selected_userinfo_signing_alg_values_supported" : [], \
	"selected_userinfo_encryption_alg_values_supported" : [], \
	"selected_userinfo_encryption_enc_values_supported" : [], \
	"selected_token_endpoint_auth_signing_alg_values_supported" : [], \
	"scopes_supported" : [] \
}
```

#### Lifecycle Coordinator
Automation currently will only install the Lifecycle Coordinator feature.  Note that there is required tasks that need to be done in the /admin console.

* `database.coordinator=true` on CM container properties will install one of the database schemas. The Lifecycle Coordinator Schema will need to be installed manually on the /admin console.
* `lifecycle.coordinator=true` on CM container properties will install the feature to the container.

Set the search engines that can be used in any process scripts.  It is recommended that you only set to use `js`:
```properties
script.engine.manager.enabled=
script.engine.manager.engines=
```

#### Hardening Tasks
These tasks are the implementation of the [Hardening 2.0](http://docs.akana.com/sp/platform-hardening_8.4.html) recommendations.

During hardening it is recommended to run the admin console on a port different than the actual containers are listening
on.  The following properties are used to move the admin console onto a different port.  The admin console can also be
configured to listen only on the localhost interface.  To configure the admin console to use basic auth, configure
the basic auth option to be true.

```properties
	container.admin.port=8900
    container.admin.console.localhost.only=false
    container.admin.console.restricted=false
    container.admin.console.basicauth.enabled=true
```

The Metadata API includes details about the container, such as public keys, internal IP addresses and file locations, which you probably don't want to share broadly.
This information could potentially aid an attacker in fingerprinting and enumerating the Policy Manager application or discovering how some of the Java servlets are configured.
To secure the metadata API add the following property to the container properties:

```properties
    secure.metadata.service=true
```

#### Performance Tasks
These tasks are the implementation of the [Performance](http://docs.akana.com/sp/performance-tuning.html) recommendations.

com.soa.client.subsystems

| Property | Setting | Notes |
|----------|---------|-------|
| pm.client.cache.cacheExpirationSecs | 14400 (4 hours) | Expiration time for cached authentication information (default is five minutes) |
| pm.client.cache.refresh.trigger.repeatInterval | 300000 (5 minutes) | Refresh interval for cached authentication information (default is one minute) |

```properties
    # com.soa.client.subsystem
    pm.client.cache.cacheExpirationSecs=14400
    pm.client.cache.refresh.trigger.repeatInterval=300000
```

com.soa.saml

| Property | Setting | Notes |
|----------|---------|-------|
| com.soa.saml.assertion.expiration | 240 (default) | SAML Assertion expiration time (default is four hours) |

```properties
    # com.soa.saml
    com.soa.saml.assertion.expiration=240
```

com.soa.auz.client

| Property | Setting | Notes |
|--|--|--|
| cached.auz.decision.service.cacheTimeout | 300 (5 minutes) | Refresh interval for cached authorization decisions (default is one minute) |
| cached.auz.decision.service.expirationTimeInSeconds | 14400 (4 hours) | Expiration time for cached authorization decisions (default is 30 minutes) |


```properties
    # com.soa.auz.client (ND containers only)
    cached.auz.decision.service.cacheTimeout=300
    cached.auz.decision.service.expirationTimeInSeconds=14400
```

com.soa.container.configuration.service

| Property | Setting | Notes |
|--|--|--|
| container.refresh.trigger.repeatInterval | 120000 (2 minutes) | Interval for checking for changes to container configuration (default is 15 seconds) |

```properties
    # com.soa.container.configuration.service
    container.refresh.trigger.repeatInterval=120000
```    

com.soa.mp.core

| Property | Setting | Notes |
|--|--|--|
| rules.expiration.trigger.repeatInterval | 60000 (1 minute) |Interval between checking of the expiration of a Denial of Service (DoS) rule action expiration (default is one second) |
```properties
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

```properties
    # Custom Features
    custom.features=
```

To install the Endpoint selector and the API Hook features you would include the following; `custom.features=com.akana.pso.endpointselector.version,com.akana.pso.apihooks.extensions`.

NOTE: Automation will not complete any extra configuration tasks, like installing or updating schema tasks.  These tasks will need to be completed manually.

##### Custom Properties

Additional properties can be added into any category.  These are useful when a category, that doesn't exist out of the box, needs to be added to any configuration category.  There will be no field validation when adding properties in this manner.

These properties are added by including the following property in any container property file:

```properties
    # Custom Properties to be added into any configuration category.
    custom.properties={ \
    	"pids": [{ \
      	    "pid": "<name of pid, like com.soa.log>", \
      	    "properties": [{\
      		    "property": "name of property, like log4j.appender.SYSLOG>", \
      		    "value": "<value of property to be set"
    	    }]\
      	}] \
    }
```

If it was required to add SYSLOG into the `com.soa.log` category, the property would look like:

```properties
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

```properties
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
    # deprecated use the listener property below
    container.listener.minimum=
    # deprecated use the listener property below
    container.listener.maximum=
    # deprecated use the listener property below
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
    mq.support=false

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

    # ToolSection
    72.upgrade=false
    admin.monitoring.tool=true
    80.upgrade=false
    82.upgrade=false
    admin.health.tool=true

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
    # to create listeners on any type of container.
    #{
    #    'Endpoints': [{
    #        'name':<name of listener>,
    #        'description':<description of listener>,
    #        'bindtoall':<True/False>,
    #        'protocol':<http/https>,
    #        'host':<host name>,
    #        'port':<port number>,
    #        'contextPath':<context path>,
    #        'minimumThreadPool':<minimum>,
    #        'maximumThreadPool':<maximum>,
    #        'idleThreadTimeout':<idle timeout>,
    #        'alias':<alias of key in keystore>,
    #        'aliasPassword':<alias of password>
    #    }]
    #}
    listener=
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

    # ccom.soa.scheduler.quartz
    org.quartz.scheduler.enabled=true

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
    #       "deploymentzones": [{\
    #           "name": "apigateway"\
    #       }]\
    #		"themes": [{\
    #			"name": "simpledev",\
    #			"virtualhost": "developer-localhost",\
    #			"consoleaddress": "https://developer-localhost:19910/devportal",\
    #			"themeimpl": "default"
    #		}]\
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
    performance.framework.makeRereshInterval=900
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
Copyright &copy; 2017 RogueWave, Inc. All Rights Reserved.

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
