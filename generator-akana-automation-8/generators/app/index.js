'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var java = require('java');

java.classpath.push("generators/app/com.akana.ps.automation.security.jar");
var PasswordUtil = java.import('com.akana.ps.automation.security.PropertyEncryption');

var globalContainerType = '';

module.exports = yeoman.generators.Base.extend({
    container: function () {
        var done = this.async();

        // Have Yeoman greet the user.
        this.log(yosay(
            'Welcome to the striking ' + chalk.red('generator-akana-automation-8') + ' generator!'
        ));

        this.log(yosay(
            'Need to get some information to properly build all of the required property files.'
        ));

        var prompts = [{
            type: 'input',
            name: 'name',
            message: 'What is the name of the container to be created (akana_<container>_<env>_#)?',
            store: true
        },{
            type: 'confirm',
            name: 'installSoftware',
            message: 'Does the software need installed?',
            store: true,
            default: true
        },{
            type: 'input',
            name: 'installPath',
            message: 'What is the location to install the software?',
            store: true,
            default: '/opt/akana_sw/',
            when: function (answers) {
                return answers.installSoftware;
            }
        },{
            type: 'list',
            name: 'environmentType',
            message: 'Type of environment?',
            choices: [
                'linux',
                'Windows'
            ],
            store: true,
            default: 'linux',
            when: function (answers) {
             return answers.installSoftware;
            }
        },{
            type: 'input',
            name: 'resourcesLocation',
            message: 'Where are the install resources located at?',
            store: true,
            default: '/tmp/automation/stage/resources',
            when: function (answers) {
                return answers.installSoftware;
            }
        },{
            type: 'confirm',
            name: 'keyDecision',
            message: 'Custom Container Key required?',
            default: false
        },{
            type: 'input',
            name: 'key',
            message: 'Custom Container Key value?',
            store: true,
            when: function (answers) {
                return answers.keyDecision;
            }
        },{
            type: 'input',
            name: 'host',
            message: 'Host name of the server?',
            store: true,
            default: '0.0.0.0'
        },{
            type: 'input',
            name: 'port',
            message: 'Port number that will be serving the container?',
            store: true,
            default: '9900'
        },{
            type: 'confirm',
            name: 'updateListenerDecision',
            message: 'Update Listener details?',
            default: false
        },{
            type: 'input',
            name: 'listenerMinimum',
            message: 'Minimum allowed connections?',
            store: true,
            default: '3',
            when: function (answers) {
                return answers.updateListenerDecision;
            }
        },{
            type: 'input',
            name: 'listenerMaximum',
            message: 'Maximum allowed connections?',
            store: true,
            default: '100',
            when: function (answers) {
                return answers.updateListenerDecision;
            }
        },{
            type: 'input',
            name: 'listenerIdleTimeout',
            message: 'Listener timeout amount?',
            store: true,
            default: '180000',
            when: function (answers) {
                return answers.updateListenerDecision;
            }
        },{
            type: 'input',
            name: 'adminUser',
            message: 'Default Administrator user?',
            store: true,
            default: 'administrator'
        },{
            type: 'input',
            name: 'adminPassword',
            message: 'Default Administrator Password?',
            store: true,
            default: 'password'
        },{
            type: 'confirm',
            name: 'encryptPassword',
            message: 'Should Passwords be encrypted?',
            store: true,
            default: true
        },{
            type: 'input',
            name: 'secure',
            message: 'Should the container be secured or not?',
            store: true,
            default: 'true'
        },{
            type: 'input',
            name: 'secureKeystore',
            message: 'Highly recommended to use custom keystores.  Please enter the secure (bootstrap) keystore?',
            store: true,
            when: function (answers) {
                return answers.secure === 'true';
            }
        },{
            type: 'input',
            name: 'secureStorepass',
            message: 'Secure (bootstrap) keystore password?',
            store: true,
            when: function (answers) {
                return answers.secure === 'true';
            }
        },{
            type: 'input',
            name: 'secureAlias',
            message: 'Secure (bootstrap) keystore alias?',
            store: true,
            when: function (answers) {
                return answers.secure === 'true';
            }
        },{
            type: 'input',
            name: 'secureTrustedKeystore',
            message: 'Secure trusted keystore?',
            store: true,
            when: function (answers) {
                return answers.secure === 'true';
            }
        },{
            type: 'input',
            name: 'secureTrustedStorepass',
            message: 'Secure trusted keystore password?',
            store: true,
            when: function (answers) {
                return answers.secure === 'true';
            }
        },{
            type: 'list',
            name: 'containerDebugLevel',
            choices: [
                'DEBUG',
                'INFO',
                'WARNING',
                'ERROR',
                'CRITICAL'
            ],
            message: 'Log Level for the container build?',
            store: true,
            default: 'ERROR'
        }];

        this.prompt(prompts, function (container) {
            if (container.encryptPassword) {
                var adminEncryptedPassword = java.callStaticMethodSync('com.akana.ps.automation.security.PropertyEncryption', 'encryptString', container.adminPassword);
                container.adminPassword = adminEncryptedPassword;
                if (container.secure) {
                    var bootstrapEncryptedPassword = java.callStaticMethodSync('com.akana.ps.automation.security.PropertyEncryption', 'encryptString', container.secureStorepass);
                    var trustedEncryptedPassword = java.callStaticMethodSync('com.akana.ps.automation.security.PropertyEncryption', 'encryptString', container.secureTrustedStorepass);
                    container.secureStorepass = bootstrapEncryptedPassword;
                    container.secureTrustedStorepass = trustedEncryptedPassword;
                }
            }

            this.container = container;
            this.log(this.container);
            // To access props later use this.props.someOption;
            this.config.set(container);
            done();
        }.bind(this));
    },

    features: function () {
        var done = this.async();

        this.log(yosay('Which features need to be installed and configure in this container?'));

        var prompts = [{
            type: 'list',
            name: 'containerType',
            choices: [
                'PM Only',
                'PM with CM',
                'PM with CM/Oauth',
                'PM with remote CM',
                'PM with PMDP',
                'CM only',
                'CM/Oauth',
                'ND',
                'ND with API support',
                'ND with Oauth',
                'Oauth only',
                'PMDP Master',
                'PMDP Slave'
            ],
            message: 'Choose the appropriate conter type and Add on features'
        },{
            type: 'input',
            name: 'platformVersion',
            message: 'Version of Akana Platform to install?',
            store: true,
            default: '8.1'
        },{
            type: 'input',
            name: 'pmVersion',
            message: 'Version of PM to install?',
            store: true,
            default: '8.0'
        },{
            type: 'input',
            name: 'cmVersion',
            message: 'Version of CM to install?',
            store: true,
            default: '8.0',
            when: function (answers) {
                return answers.containerType.indexOf('CM') > -1;
            }
        },{
            type: 'confirm',
            name: 'configureDatabase',
            message: 'Configure a Database Connection?',
            store: true,
            default: true,
            when: function (answers) {
                return answers.containerType.indexOf('ND') < 0;
            }
        },{
            type: 'confirm',
            name: 'createDatabase',
            message: 'Create Database?',
            store: true,
            default: false,
            when: function (answers) {
                return answers.configureDatabase;
            }
        },{
            type: 'confirm',
            name: 'recreateDatabase',
            message: 'Rereate Database, if it already exists?',
            store: true,
            default: false,
            when: function (answers) {
                return answers.createDatabase;
            }
        },{
            type: 'list',
            name: 'databaseType',
            message: 'Which Database?',
            choices: ['mssql', 'mysql', 'oracle', 'oracle-sn', 'db2'],
            store: true,
            when: function (answers) {
                return answers.configureDatabase;
            }
        },{
            type: 'input',
            name: 'databaseUser',
            message: 'Database User?',
            store: true,
            default: 'akana_user',
            when: function (answers) {
                return answers.configureDatabase;
            }
        },{
            type: 'input',
            name: 'databasePassword',
            message: 'Database User Password?',
            store: true,
            when: function (answers) {
                return answers.configureDatabase;
            }
        },{
            type: 'input',
            name: 'databaseAdminUser',
            message: 'Database Administrator User?',
            store: true,
            when: function (answers) {
                return answers.configureDatabase;
            }
        },{
            type: 'input',
            name: 'databaseAdminPassword',
            message: 'Database Administrator Password?',
            store: true,
            when: function (answers) {
                return answers.configureDatabase;
            }
        },{
            type: 'input',
            name: 'databaseHost',
            message: 'Database host server?',
            store: true,
            when: function (answers) {
                return answers.configureDatabase;
            }
        },{
            type: 'input',
            name: 'databasePort',
            message: 'Database host port?',
            store: true,
            when: function (answers) {
                return answers.configureDatabase;
            }
        },{
            type: 'input',
            name: 'databaseName',
            message: 'Database name (for oracle use tablespace)?',
            store: true,
            when: function (answers) {
                return answers.configureDatabase;
            }
        },{
            type: 'input',
            name: 'databaseJar',
            message: 'Database driver location (provide absolute path)?',
            store: true,
            when: function (answers) {
                return answers.configureDatabase;
            }
        },{
            type: 'input',
            name: 'databaseInstanceName',
            message: 'Database instance name (mssql/oracle only)?',
            store: true,
            when: function (answers) {
                return answers.configureDatabase && (answers.databaseType === 'mssql' || answers.databaseType.indexOf('oracle') > -1);
            }
        },{
            type: 'input',
            name: 'databaseTablespace',
            message: 'Database tablespace (DB2 only)?',
            store: true,
            when: function (answers) {
                return answers.configureDatabase && answers.databaseType === 'db2';
            }
        },{
            type: 'input',
            name: 'databaseBufferName',
            message: 'Database buffer name (DB2 only)?',
            store: true,
            when: function (answers) {
                return answers.configureDatabase && answers.databaseType === 'db2';
            }
        },{
            type: 'confirm',
            name: 'databaseIsNewBuffer',
            message: 'Is database buffer new?',
            store: true,
            default: false,
            when: function (answers) {
                return answers.configureDatabase && answers.databaseType === 'db2';
            }
        },{
            type: 'confirm',
            name: 'customConnection',
            message: 'Customize database connection parameters?',
            store: true,
            when: function (answers) {
                return answers.configureDatabase;
            }
        },{
            type: 'input',
            name: 'databaseMaxPoolSize',
            message: 'Database Max Connections?',
            store: true,
            default: '30',
            when: function (answers) {
                return answers.configureDatabase && answers.customConnection;
            }
        },{
            type: 'input',
            name: 'databaseMinPoolSize',
            message: 'Database Min Connections?',
            store: true,
            default: '3',
            when: function (answers) {
                return answers.configureDatabase && answers.customConnection;
            }
        },{
            type: 'input',
            name: 'databaseMaxWait',
            message: 'Database Max Wait?',
            store: true,
            default: '30000',
            when: function (answers) {
                return answers.configureDatabase && answers.customConnection;
            }
        },{
            type: 'list',
            name: 'databaseDebugLevel',
            choices: [
                'DEBUG',
                'INFO',
                'WARNING',
                'ERROR',
                'CRITICAL'
            ],
            message: 'Log Level for the database build?',
            store: true,
            default: 'CRITICAL',
            when: function (answers) {
                return answers.configureDatabase;
            }
        },{
            type: 'confirm',
            name: 'installMongoDB',
            message: 'Install MongoDB Feature?',
            store: true,
            default: false,
            when: function (answers) {
                return answers.containerType.indexOf('PM') > -1;
            }
        },{
            type: 'input',
            name: 'mongodbHost',
            message: 'MongoDB Host?',
            store: true,
            default: 'localhost',
            when: function (answers) {
                return answers.installMongoDB;
            }
        },{
            type: 'input',
            name: 'mongodbPort',
            message: 'MongoDB Port?',
            store: true,
            default: '27017',
            when: function (answers) {
                return answers.installMongoDB;
            }
        },{
             type: 'input',
             name: 'mongodbUsername',
             message: 'MongoDB Username?',
             store: true,
             default: '',
             when: function (answers) {
                 return answers.installMongoDB;
             }
         },{
              type: 'input',
              name: 'mongodbPassword',
              message: 'MongoDB Password?',
              store: true,
              default: '',
              when: function (answers) {
                  return answers.installMongoDB;
              }
          },{
               type: 'input',
               name: 'mongodbThreads',
               message: 'MongoDB Number of Threads?',
               store: true,
               default: '20',
               when: function (answers) {
                   return answers.installMongoDB;
               }
           },{
            type: 'input',
            name: 'msmexAddress',
            message: 'Address to PM console?',
            store: true,
            default: 'https://<host>:<port>/',
            when: function (answers) {
                return answers.containerType.indexOf('PM') < -1;
            }
        },{
            type: 'confirm',
            name: 'adminConsoleDifferent',
            message: 'Is the PM Admin console running on a different port?',
            store: true,
            default: false
        },{
            type: 'input',
            name: 'pmAdminConsole',
            message: 'Address to PM admin console (http://localhost:8900)?',
            store: true,
            default: '',
            when: function (answers) {
              return answers.adminConsoleDifferent;
            }
        },{
            type: 'confirm',
            name: 'configjobSecured',
            message: 'PM admin configjob secured?',
            store: true,
            default: true,
            when: function (answers) {
                return answers.containerType.indexOf('PM') < -1;
            }
        },{
            type: 'input',
            name: 'pmAdminUser',
            message: 'PM admin user?',
            store: true,
            default: 'administrator',
            when: function (answers) {
                return answers.configjobSecured;
            }
        },{
            type: 'input',
            name: 'pmAdminPassword',
            message: 'PM admin password?',
            store: true,
            default: 'password',
            when: function (answers) {
                return answers.configjobSecured;
            }
        },{
            type: 'input',
            name: 'registrationOrg',
            message: 'Organization UDDI to register ND too?',
            store: true,
            default: 'uddi:soa.com:registryorganization',
            when: function (answers) {
                return answers.containerType.indexOf('ND') > -1;
            }
        },{
            type: 'confirm',
            name: 'createNDListeners',
            message: 'Create/Update ND listeners?',
            store: true,
            when: function (answers) {
                return answers.containerType.indexOf('ND') > -1;
            }
        },{
            type: 'confirm',
            name: 'createCluster',
            message: 'Add ND to Cluster (if cluster doesn"t exist, it will be created)?',
            store: true,
            default: true,
            when: function (answers) {
                return answers.containerType.indexOf('ND') > -1;
            }
        },{
            type: 'input',
            name: 'clusterName',
            message: 'Container Name of Cluster?',
            store: true,
            when: function (answers) {
                return answers.createCluster;
            }
        },{
            type: 'confirm',
            name: 'createClusterListeners',
            message: 'Create Cluster listeners?',
            store: true,
            when: function (answers) {
                return answers.createCluster;
            }
        },{
            type: 'confirm',
            name: 'pingFederate',
            message: 'Include PingFederate?',
            store: true,
            default: false
        },{
            type: 'confirm',
            name: 'laas',
            message: 'Include Laas?',
            store: true,
            default: false
        },{
            type: 'confirm',
            name: 'monitoring',
            message: 'Include monitoring?',
            store: true,
            default: false
        },{
            type: 'confirm',
            name: 'siteMinder',
            message: 'Include Site Minder?',
            store: true,
            default: false
        },{
            type: 'input',
            name: 'siteMinderPath',
            message: 'Installation path of Site Minder?',
            store: true,
            when: function (answers) {
                return answers.siteMinder;
            }
        },{
            type: 'confirm',
            name: 'samlWebSSO',
            message: 'Include SAML Web SSO?',
            store: true,
            default: false
        },{
            type: 'confirm',
            name: 'developmentServices',
            message: 'Include Development Services?',
            store: true,
            default: false
        },{
            type: 'confirm',
            name: 'pingSupport',
            message: 'Include Ping Service?',
            store: true,
            default: false
        }];

        var dependencies = [];
        var dependency = function(self) {

            self.log(yosay('Create some ND Listeners!'));

            var listenerDetails = [{
                type: 'input',
                name: 'listenerName',
                message: 'Name of the listener (https_default0)?'
            },{
                type: 'input',
                name: 'hostname',
                message: 'Host of the server?'
            },{
                type: 'input',
                name: 'port',
                message: 'Listening port?'
            },{
                type: 'confirm',
                name: 'protocol',
                message: 'Port secured?'
            },{
                type: 'input',
                name: 'listenerTimeout',
                message: 'Listener Timeout?',
                default: '180000'
            },{
                type: 'input',
                name: 'listenerPoolMax',
                message: 'Max Listeners?',
                default: '100'
            },{
                type: 'input',
                name: 'listenerPoolMin',
                message: 'Min Listeners?',
                default: '3'
            },{
                type: 'confirm',
                name: 'listenerBind',
                message: 'Bind to all interfaces?',
                default: false
            },{
                type: 'input',
                name: 'listenerAlias',
                message: 'Alias of the certificate to add to this listener?'
            },{
                type: 'confirm',
                name: 'askAgain',
                default: false,
                message: 'Add another listener?'
            }];

            self.prompt(listenerDetails, function(props) {
                self.log(props);
                dependencies.push(props);
                self.log('dependencies: ' + dependencies);
                if (props['askAgain']) {
                    dependency(self);
                }
                else {
                    self.log('out!')
                    self.log('dependencies out: ' + dependencies)
                    self.dependencies = dependencies;
                    self.config.set(dependencies);
                    if (self.features.createClusterListeners) {
                        clusterDependency(self);
                    } else {
                        done();
                    }
                }
            });
        };

        var clusterDependencies = [];
        var clusterDependency = function(self) {

            self.log(yosay('Create some cluster Listeners!'));

            var listenerDetails = [{
                type: 'input',
                name: 'listenerName',
                message: 'Name of the listener (https_default0)?'
            },{
                type: 'input',
                name: 'hostname',
                message: 'Host of the server?'
            },{
                type: 'input',
                name: 'port',
                message: 'Listening port?'
            },{
                type: 'confirm',
                name: 'protocol',
                message: 'Port secured?'
            },{
                type: 'input',
                name: 'listenerTimeout',
                message: 'Listener Timeout?',
                default: '180000'
            },{
                type: 'input',
                name: 'listenerPoolMax',
                message: 'Max Listeners?',
                default: '100'
            },{
                type: 'input',
                name: 'listenerPoolMin',
                message: 'Min Listeners?',
                default: '3'
            },{
                type: 'confirm',
                name: 'listenerBind',
                message: 'Bind to all interfaces?',
                default: false
            },{
                type: 'confirm',
                name: 'askAgain',
                default: false,
                message: 'Add another listener?'
            }];

            self.prompt(listenerDetails, function(props) {
                self.log(props);
                clusterDependencies.push(props);
                self.log('cluster dependencies: ' + clusterDependencies)
                if (props['askAgain']) {
                    clusterDependency(self);
                }
                else {
                    self.log('out!')
                    self.log('cluster dependencies out: ' + clusterDependencies)
                    self.clusterDependencies = clusterDependencies;
                    self.config.set(clusterDependencies);
                    done();
                }
            });
        };

        this.prompt(prompts, function(features) {
            if (this.container.encryptPassword) {
                if (features.configureDatabase) {
                    var adminEncryptedPassword = java.callStaticMethodSync('com.akana.ps.automation.security.PropertyEncryption', 'encryptString', features.databaseAdminPassword);
                    var userEncryptedPassword = java.callStaticMethodSync('com.akana.ps.automation.security.PropertyEncryption', 'encryptString', features.databasePassword);
                    features.databaseAdminPassword = adminEncryptedPassword;
                    features.databasePassword = userEncryptedPassword;
                }

                if (features.configjobSecured) {
                    var pmAdminEncryptedPassword = java.callStaticMethodSync('com.akana.ps.automation.security.PropertyEncryption', 'encryptString', features.pmAdminPassword);
                    features.pmAdminPassword = pmAdminPassword;
                }
            }
            this.features = features;
            this.log(this.features);
            this.config.set(features);

            globalContainerType = features.containerType;

            if (features.createNDListeners) {
                dependency(this);
            } else {
                done();
            }

        }.bind(this));

    },

    tenant: function () {
        var done = this.async();

        var prompts = [{
            type: 'confirm',
            name: 'createTenant',
            message: 'Create new tenant?',
            default: false
        },{
            type: 'input',
            name: 'url',
            message: 'Tenant URL (http://localhost:9900)?',
            store: true,
            default: '',
            when: function (answers) {
                return answers.createTenant;
            }
        },{
            type: 'input',
            name: 'tenantName',
            message: 'Tenant Name?',
            store: true,
            default: 'Enterprise API',
            when: function (answers) {
                return answers.createTenant;
            }
        },{
            type: 'input',
            name: 'id',
            message: 'Tenant ID?',
            store: true,
            default: 'enterpriseapi',
            when: function (answers) {
                return answers.createTenant;
            }
        },{
            type: 'input',
            name: 'address',
            message: 'Tenant Address (http://localhost:9900)?',
            store: true,
            default: '',
            when: function (answers) {
                return answers.createTenant;
            }
        },{
            type: 'input',
            name: 'consoleAddress',
            message: 'Tenant Console Address (http://localhost:9900/enterpriseapi)?',
            store: true,
            default: '',
            when: function (answers) {
                return answers.createTenant;
            }
        },{
            type: 'input',
            name: 'theme',
            message: 'Theme?',
            store: true,
            default: 'default',
            when: function (answers) {
                return answers.createTenant;
            }
        },{
            type: 'input',
            name: 'adminEmail',
            message: 'Tenant Admin Email?',
            store: true,
            default: 'admin@open',
            when: function (answers) {
                return answers.createTenant;
            }
        },{
            type: 'input',
            name: 'tenantAdminPassword',
            message: 'Tenant Admin Password?',
            store: true,
            default: 'password',
            when: function (answers) {
                return answers.createTenant;
            }
        },{
            type: 'input',
            name: 'contactEmailAddress',
            message: 'Tenant Contact Email Address?',
            store: true,
            default: 'no-reply@open',
            when: function (answers) {
                return answers.createTenant;
            }
        },{
            type: 'input',
            name: 'fromEmailAddress',
            message: 'Tenant from Email Address?',
            store: true,
            default: 'no-reply@open',
            when: function (answers) {
                return answers.createTenant;
            }
        },{
            type: 'input',
            name: 'virtualHosts',
            message: 'Virtual Hosts (COMMA DELIMITED LIST)?',
            store: true,
            default: '',
            when: function (answers) {
                return answers.createTenant;
            }
        },{
            type: 'input',
            name: 'atmosphereContextRoot',
            message: 'Context Root to CM?',
            store: true,
            default: '/enterpriseapi'
        },{
            type: 'input',
            name: 'atmosphereConfigUserRolesDenied',
            message: 'Atmosphere Config User Roles Denied?',
            store: true,
            default: ''
        }];

        if (globalContainerType.indexOf('CM') > -1 && globalContainerType.indexOf('remote') < 0) {
            this.log(yosay('CM Tenant settings.'));

            this.prompt(prompts, function (tenant) {
                if (this.container.encryptPassword) {
                    var encryptedPassword = java.callStaticMethodSync('com.akana.ps.automation.security.PropertyEncryption', 'encryptString', tenant.tenantAdminPassword);
                    tenant.tenantAdminPassword = encryptedPassword;;
                }
                this.tenant = tenant;
                this.log(this.tenant);
                // To access props later use this.props.someOption;
                this.config.set(tenant);
                done();
            }.bind(this));
        } else {
            done();
        }
    },

    configFiles: function () {
        var done = this.async();

        this.log(yosay('Configure some Misc properties.'));

        var prompts = [{
            type: 'confirm',
            name: 'createProxy',
            message: 'Is a proxy configuration needed?',
            default: false
        },{
            type: 'input',
            name: 'proxyUrl',
            message: 'Proxy URL?',
            store: true,
            default: '',
            when: function (answers) {
                return answers.createProxy;
            }
        },{
            type: 'input',
            name: 'proxy',
            message: 'Proxy?',
            store: true,
            default: '',
            when: function (answers) {
                return answers.createProxy;
            }
        },{
            type: 'input',
            name: 'proxyUser',
            message: 'Proxy User?',
            store: true,
            default: '',
            when: function (answers) {
                return answers.createProxy;
            }
        },{
            type: 'input',
            name: 'proxyPassword',
            message: 'Proxy Password?',
            store: true,
            default: '',
            when: function (answers) {
                return answers.createProxy;
            }
        },{
            type: 'input',
            name: 'proxyFileName',
            message: 'Proxy File Name?',
            store: true,
            default: '',
            when: function (answers) {
                return answers.createProxy;
            }
        },{
            type: 'confirm',
            name: 'createRouteDefinitions',
            message: 'Create Route Definition Files?',
            store: true,
            default: false
        },{
            type: 'confirm',
            name: 'enableRemoteDatabaseWriter',
            message: 'Enable Remote Database Writer?',
            store: true,
            default: false
        }];

        var routeDefinitions = [];
        var dependency = function(self) {

            var routeQuestions = [{
                type: 'input',
                name: 'routeFilename',
                message: 'Route Filename (com.soa.http.route-pm1.cfg)?'
            },{
                type: 'input',
                name: 'routePattern',
                message: 'Route Pattern (http://pm.host.com:9900/*)?'
            },{
                type: 'input',
                name: 'routeUrl',
                message: 'Route URL (http://lb.host.com)?'
            },{
                type: 'confirm',
                name: 'askAgain',
                default: false,
                message: 'Add another route definition?'
            }];

            self.prompt(routeQuestions, function(props) {
                self.log(props);
                routeDefinitions.push(props);
                self.log('dependencies: ' + routeDefinitions);
                if (props['askAgain']) {
                    dependency(self);
                }
                else {
                    self.log('out!')
                    self.log('dependencies out: ' + routeDefinitions)
                    self.routeDefinitions = routeDefinitions;
                    self.config.set(routeDefinitions);
                    done();
                }
            });
        };

        this.prompt(prompts, function (configFiles) {
            if (this.container.encryptPassword) {
                var encryptedPassword = java.callStaticMethodSync('com.akana.ps.automation.security.PropertyEncryption', 'encryptString', configFiles.proxyPassword);
                configFiles.proxyPassword;
            }

            this.configFiles = configFiles;
            this.log(this.configFiles);
            // To access props later use this.props.someOption;
            this.config.set(configFiles);

            if (configFiles.createRouteDefinitions) {
                this.log(yosay('Create some route definitions!'));
                dependency(this);
            } else {
                done();
            }

        }.bind(this));
    },

    performance: function () {
        var done = this.async();

        this.log(yosay('Performance settings for the container.'));

        var prompts = [{
            type: 'confirm',
            name: 'setPerformance',
            message: 'Should performance settings be set?',
            default: true
        },{
            type: 'input',
            name: 'performanceConnectionMaxTotal',
            message: 'Connection Max Total?',
            store: true,
            default: '2000',
            when: function (answers) {
                return answers.setPerformance;
            }
        },{
            type: 'input',
            name: 'performanceConnectionDefaultMaxPerRoute',
            message: 'Connection Default Max Per Route?',
            store: true,
            default: '1500',
            when: function (answers) {
                return answers.setPerformance;
            }
        },{
            type: 'confirm',
            name: 'performanceLoadGifMetrics',
            message: 'Load Gif Metrics?',
            store: true,
            default: false,
            when: function (answers) {
                return answers.setPerformance;
            }
        },{
            type: 'confirm',
            name: 'performancePerformAutoSearch',
            message: 'Perform Auto Search?',
            store: true,
            default: true,
            when: function (answers) {
                return answers.setPerformance;
            }
        },{
            type: 'confirm',
            name: 'performanceRequireMetricsPolicy',
            message: 'Require Metrics Policy?',
            store: true,
            default: true,
            when: function (answers) {
                return answers.setPerformance;
            }
        },{
            type: 'confirm',
            name: 'performanceFailureDataCaptureEnabled',
            message: 'Failure Data Capture Enabled?',
            store: true,
            default: true,
            when: function (answers) {
                return answers.setPerformance;
            }
        },{
            type: 'input',
            name: 'performanceQueueCapacity',
            message: 'Queue Capacity?',
            store: true,
            default: '10000',
            when: function (answers) {
                return answers.setPerformance;
            }
        },{
            type: 'input',
            name: 'performanceUsageBatchSize',
            message: 'Usage Batch Size?',
            store: true,
            default: '50',
            when: function (answers) {
                return answers.setPerformance;
            }
        },{
            type: 'input',
            name: 'performanceWriteInterval',
            message: 'Write Interval?',
            store: true,
            default: '1000',
            when: function (answers) {
                return answers.setPerformance;
            }
        },{
            type: 'confirm',
            name: 'performancePreloadInvokedServices',
            message: 'Preload Invoked Services?',
            store: true,
            default: true,
            when: function (answers) {
                return answers.setPerformance;
            }
        },{
            type: 'input',
            name: 'performanceFrameworkIdleExpiration',
            message: 'Framework Idle Expiration?',
            store: true,
            default: '259200',
            when: function (answers) {
                return answers.setPerformance;
            }
        },{
            type: 'input',
            name: 'performanceFrameworkMakeFreshInterval',
            message: 'Framework Make Fresh Interval?',
            store: true,
            default: '900',
            when: function (answers) {
                return answers.setPerformance;
            }
        },{
            type: 'confirm',
            name: 'performanceEndpointAllowRemoval',
            message: 'Endpoint Allow Removal?',
            store: true,
            default: false,
            when: function (answers) {
                return answers.setPerformance;
            }
        },{
            type: 'input',
            name: 'performanceEndpointExpirationInterval',
            message: 'Endpoint Expiration Interval?',
            store: true,
            default: '3600000',
            when: function (answers) {
                return answers.setPerformance;
            }
        },{
            type: 'input',
            name: 'performanceEndpointMaxrefreshInterval',
            message: 'Endpoint Max refresh Interval?',
            store: true,
            default: '900000',
            when: function (answers) {
                return answers.setPerformance;
            }
        }];

        this.prompt(prompts, function (performance) {
            this.performance = performance;
            this.log(this.performance);
            // To access props later use this.props.someOption;
            this.config.set(performance);
            done();
        }.bind(this));
    },

    hardening: function () {
        var done = this.async();

        this.log(yosay('Hardening settings for the container.'));

        var prompts = [{
            type: 'confirm',
            name: 'setHardening',
            message: 'Should hardening settings be set?',
            default: true
        },{
            type: 'input',
            name: 'ignoreCookies',
            message: 'Ignore Cookies?',
            store: true,
            default: 'ignoreCookies',
            when: function (answers) {
                return answers.setHardening;
            }
        },{
            type: 'input',
            name: 'adminPort',
            message: 'Admin console port?',
            store: true,
            default: '8900',
            when: function (answers) {
                return answers.setHardening;
            }
        },{
            type: 'confirm',
            name: 'secureCookies',
            message: 'Secure Cookies?',
            store: true,
            default: true,
            when: function (answers) {
                return answers.setHardening;
            }
        },{
            type: 'input',
            name: 'cipherSuites',
            message: 'Cipher Suites?',
            store: true,
            default: 'SSL_RSA_WITH_RC4_128_MD5,SSL_RSA_WITH_RC4_128_SHA,TLS_RSA_WITH_AES_128_CBC_SHA,TLS_DHE_DSS_WITH_AES_128_CBC_SHA,SSL_RSA_WITH_3DES_EDE_CBC_SHA,SSL_DHE_DSS_WITH_3DES_EDE_CBC_SHA',
            when: function (answers) {
                return answers.setHardening;
            }
        },{
            type: 'input',
            name: 'cacheRefreshTime',
            message: 'Cache Refresh Time?',
            store: true,
            default: '300000',
            when: function (answers) {
                return answers.setHardening;
            }
        },{
            type: 'input',
            name: 'ndInterceptorBlocked',
            message: 'ND Interceptor Blocked?',
            store: true,
            default: 'content-type,content-length,content-range,content-md5,host,expect,keep-alive,connection,transfer-encoding,atmo-forward-to,atmo-forwarded-from',
            when: function (answers) {
                return answers.setHardening;
            }
        },{
            type: 'input',
            name: 'ndTemplate',
            message: 'ND Template?',
            store: true,
            default: 'replace=X-Forwarded-Host:{host}',
            when: function (answers) {
                return answers.setHardening;
            }
        },{
            type: 'input',
            name: 'cmInterceptorBlocked',
            message: 'CM Interceptor Blocked?',
            store: true,
            default: 'content-type,content-length,content-range,content-md5,host,expect,keep-alive,connection,transfer-encoding',
            when: function (answers) {
                return answers.setHardening;
            }
        },{
            type: 'input',
            name: 'cmTemplate',
            message: 'CM Template?',
            store: true,
            default: '',
            when: function (answers) {
                return answers.setHardening;
            }
        },{
            type: 'input',
            name: 'enabledProtocols',
            message: 'Enabled Protocols?',
            store: true,
            default: 'SSLv2HELLO,TLSv1,TLSv1.1, TLSv1.2',
            when: function (answers) {
                return answers.setHardening;
            }
        },{
            type: 'input',
            name: 'ndReplaceHost',
            message: 'ND Replace Host?',
            store: true,
            default: '{host}',
            when: function (answers) {
                return answers.setHardening;
            }
        },{
            type: 'input',
            name: 'ndSecurityExpirationPeriod',
            message: 'ND Security Expiration Period?',
            store: true,
            default: '3600000',
            when: function (answers) {
                return answers.setHardening;
            }
        },{
            type: 'input',
            name: 'ndSecurityRefreshTime',
            message: 'ND Security Refresh Time?',
            store: true,
            default: '300000',
            when: function (answers) {
                return answers.setHardening;
            }
        },{
            type: 'input',
            name: 'cmAllowedHosts',
            message: 'CM Allowed Hosts (Network Director Host(s) and/or Load Balancer host)?',
            store: true,
            default: '',
            when: function (answers) {
                return answers.setHardening;
            }
        },{
            type: 'confirm',
            name: 'cmCsrfEnabled',
            message: 'CM CSRF Enabled?',
            store: true,
            default: true,
            when: function (answers) {
                return answers.setHardening;
            }
        },{
            type: 'input',
            name: 'cmExceptionUrls',
            message: 'CM Exception URLs (COMMA DELIMITED LIST)?',
            store: true,
            default: '',
            when: function (answers) {
                return answers.setHardening;
            }
        },{
            type: 'input',
            name: 'cmKeywords',
            message: 'CM Keywords (COMMA DELIMITED LIST)?',
            store: true,
            default: '',
            when: function (answers) {
                return answers.setHardening;
            }
        },{
            type: 'confirm',
            name: 'cmValidate',
            message: 'CM Validate?',
            store: true,
            default: true,
            when: function (answers) {
                return answers.setHardening;
            }
        },{
            type: 'input',
            name: 'cmXFrame',
            message: 'CM X-Frame (DESIRED HEADER)?',
            store: true,
            default: '',
            when: function (answers) {
                return answers.setHardening;
            }
        }];

        this.prompt(prompts, function (hardening) {
            this.hardening = hardening;
            this.log(this.hardening);
            // To access props later use this.props.someOption;
            this.config.set(hardening);
            done();
        }.bind(this));
    },

    writing: function () {
        this.log('writing!');

        var ndListener = '';
        var clusterListener = '';
        var routeDefinition = '';
        var listenerSeperator = ':';
        var listenerDivider = ',';

        if (this.container.createNDListeners) {
            // Build ND Listeners
            for (var i = 0; i < this.dependencies.length; i++) {
                var value = JSON.stringify(this.dependencies[i]);
                var parsed = JSON.parse(value);
                ndListener = ndListener.concat(parsed.listenerName + listenerSeperator + parsed.hostname + listenerSeperator + parsed.port + listenerSeperator + parsed.protocol + listenerSeperator + parsed.listenerTimeout + listenerSeperator + parsed.listenerPoolMax + listenerSeperator + parsed.listenerPoolMin + listenerSeperator + parsed.listenerBind + listenerSeperator + parsed.listenerAlias + listenerDivider);
            }
            this.log("ndListener: " + ndListener);

            if (this.container.createClusterListeners) {
                // Build Cluster Listeners
                for (var i = 0; i < this.clusterDependencies.length; i++) {
                    var value = JSON.stringify(this.clusterDependencies[i])
                    var parsed = JSON.parse(value);
                    clusterListener = clusterListener.concat(parsed.listenerName + listenerSeperator + parsed.hostname + listenerSeperator + parsed.port + listenerSeperator + parsed.protocol + listenerSeperator + parsed.listenerTimeout + listenerSeperator + parsed.listenerPoolMax + listenerSeperator + parsed.listenerPoolMin + listenerSeperator + parsed.listenerBind + listenerDivider);
                }
                this.log("clusterListener: " + clusterListener);
            }
        }

        if (this.configFiles.createRouteDefinitions) {
            // Build Route Definition
            for (var i = 0; i < this.routeDefinitions.length; i++) {
                var value = JSON.stringify(this.routeDefinitions[i]);
                var parsed = JSON.parse(value);
                routeDefinition = routeDefinition.concat(parsed.routeFilename + ';' + parsed.routePattern + ';' + parsed.routeUrl + listenerDivider);
            }
        }

        var featurePackages = this.container.environmentType === 'linux' ? 'akana-platform-linux-jre-8.1.543.zip' : 'akana-platform-win-jre-8.1.543.zip';
        featurePackages = featurePackages.concat(',', 'akana-pm-8.0.5304.zip');

        this.log('remote: ' + this.features.containerType.indexOf('remote'));

        this.fs.copyTpl(
            this.templatePath('default_container.properties'),
            this.destinationPath('properties/' + this.container.name + '.properties'),
            {
                container: this.container,
                features: this.features,
                ndListener: ndListener,
                clusterListener: clusterListener,
                performance: this.performance,
                hardening: this.hardening,
                tenant: this.tenant,
                configFiles: this.configFiles,
                routeDefinition: routeDefinition
            }
        );

        this.fs.copyTpl(
            this.templatePath('environment.properties'),
            this.destinationPath('properties/environment.properties'),
            {
                container: this.container,
                features: this.features,
                configFiles: this.configFiles
            }
        );

        this.fs.copyTpl(
            this.templatePath('installer.properties'),
            this.destinationPath('properties/installer.properties'),
            {
                container: this.container,
                featurePackages: featurePackages
            }
        );

        this.fs.copyTpl(
            this.templatePath('logging.conf'),
            this.destinationPath('properties/logging.conf'),
            {
                container: this.container,
                features: this.features
            }
        );
    }
});
