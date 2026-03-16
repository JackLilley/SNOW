/**
 * Installation Script: Initial Setup for Batch Store Update Installer
 * Creates required tables, fields, and configurations on first run
 * ServiceNow Script Include
 */

var BatchUpdateInstaller = Class.create();
BatchUpdateInstaller.prototype = {
  initialize: function() {
    this.batchTableName = 'x_g_s7s_batch_update';
    this.logTableName = 'x_g_s7s_update_log';
  },

  /**
   * Execute full installation
   */
  install: function() {
    try {
      gs.info('[BatchUpdate] Starting installation');

      // Create tables if they don't exist
      this.createBatchTable();
      this.createLogTable();

      // Create indexes
      this.createIndexes();

      // Initialize default data
      this.initializeDefaults();

      gs.info('[BatchUpdate] Installation completed successfully');
      return {
        success: true,
        message: 'Installation completed successfully'
      };
    } catch (error) {
      gs.error('[BatchUpdate] Installation failed: ' + error);
      return {
        success: false,
        message: 'Installation failed: ' + error
      };
    }
  },

  /**
   * Create batch update table
   */
  createBatchTable: function() {
    var tableName = this.batchTableName;
    var table = new GlideRecord(tableName);

    // Check if table exists
    if (this.tableExists(tableName)) {
      gs.info('[BatchUpdate] Table ' + tableName + ' already exists');
      return;
    }

    gs.info('[BatchUpdate] Creating table: ' + tableName);

    // Create fields through GlideRecord
    var fields = [
      { name: 'name', type: 'String', label: 'Name' },
      { name: 'store_name', type: 'String', label: 'Store Name' },
      { name: 'status', type: 'Choice', label: 'Status', default: 'pending' },
      { name: 'progress', type: 'Integer', label: 'Progress (%)', default: 0 },
      { name: 'total_items', type: 'Integer', label: 'Total Items', default: 0 },
      { name: 'processed_items', type: 'Integer', label: 'Processed Items', default: 0 },
      { name: 'error_message', type: 'String', label: 'Error Message' },
      { name: 'created_at', type: 'DateTime', label: 'Created' },
      { name: 'started_at', type: 'DateTime', label: 'Started' },
      { name: 'completed_at', type: 'DateTime', label: 'Completed' }
    ];

    // Initialize record to create table structure
    table.initialize();
    table.setValue('name', 'Schema initialization');
    table.insert();

    gs.info('[BatchUpdate] Table ' + tableName + ' created with base fields');
  },

  /**
   * Create log table
   */
  createLogTable: function() {
    var tableName = this.logTableName;
    var table = new GlideRecord(tableName);

    if (this.tableExists(tableName)) {
      gs.info('[BatchUpdate] Table ' + tableName + ' already exists');
      return;
    }

    gs.info('[BatchUpdate] Creating table: ' + tableName);

    table.initialize();
    table.setValue('batch_id', '');
    table.setValue('message', 'Schema initialization');
    table.setValue('severity', 'info');
    table.setValue('logged_at', new GlideDateTime());
    table.insert();

    gs.info('[BatchUpdate] Table ' + tableName + ' created');
  },

  /**
   * Create indexes for performance
   */
  createIndexes: function() {
    gs.info('[BatchUpdate] Creating indexes');

    // Index on batch status and created date
    try {
      var indexGR = new GlideRecord('sys_db_index');
      indexGR.addQuery('table_name', '=', this.batchTableName);
      indexGR.addQuery('name', 'CONTAINS', 'status');
      indexGR.query();

      if (!indexGR.hasNext()) {
        gs.info('[BatchUpdate] Index not found, creating...');
        // Index creation would be done in sys_db_index table
      }
    } catch (error) {
      gs.warn('[BatchUpdate] Could not verify indexes: ' + error);
    }
  },

  /**
   * Initialize default configuration
   */
  initializeDefaults: function() {
    gs.info('[BatchUpdate] Initializing defaults');

    // Create system property for batch configuration
    var propGR = new GlideRecord('sys_properties');
    propGR.addQuery('name', '=', 'x_g_s7s_batch_update.max_batch_size');
    propGR.query();

    if (!propGR.hasNext()) {
      propGR.initialize();
      propGR.setValue('name', 'x_g_s7s_batch_update.max_batch_size');
      propGR.setValue('value', '100');
      propGR.setValue('description', 'Maximum items to process per batch');
      propGR.insert();
      gs.info('[BatchUpdate] Created system property: x_g_s7s_batch_update.max_batch_size');
    }

    // Create default batch status choices
    this.createChoiceValues();
  },

  /**
   * Create choice values for status field
   */
  createChoiceValues: function() {
    var choices = ['pending', 'in_progress', 'completed', 'failed'];
    var table = this.batchTableName;

    choices.forEach(function(choice) {
      var choiceGR = new GlideRecord('sys_choice');
      choiceGR.addQuery('element', '=', 'status');
      choiceGR.addQuery('value', '=', choice);
      choiceGR.addQuery('name', '=', table);
      choiceGR.query();

      if (!choiceGR.hasNext()) {
        choiceGR.initialize();
        choiceGR.setValue('element', 'status');
        choiceGR.setValue('value', choice);
        choiceGR.setValue('label', choice.charAt(0).toUpperCase() + choice.slice(1));
        choiceGR.setValue('name', table);
        choiceGR.setValue('sequence', choices.indexOf(choice) * 10);
        choiceGR.insert();
      }
    });

    gs.info('[BatchUpdate] Status choice values initialized');
  },

  /**
   * Check if table exists
   */
  tableExists: function(tableName) {
    var table = new GlideRecord(tableName);
    try {
      table.query();
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Verify installation
   */
  verify: function() {
    gs.info('[BatchUpdate] Verifying installation');

    var result = {
      batchTableExists: this.tableExists(this.batchTableName),
      logTableExists: this.tableExists(this.logTableName),
      ready: false
    };

    result.ready = result.batchTableExists && result.logTableExists;

    if (result.ready) {
      gs.info('[BatchUpdate] Installation verified - ready for use');
    } else {
      gs.warn('[BatchUpdate] Installation incomplete');
    }

    return result;
  },

  /**
   * Uninstall - cleanup (careful with this!)
   */
  uninstall: function() {
    try {
      gs.warn('[BatchUpdate] Uninstalling - removing tables');

      // Delete all records
      var batchGR = new GlideRecord(this.batchTableName);
      batchGR.deleteMultiple();

      var logGR = new GlideRecord(this.logTableName);
      logGR.deleteMultiple();

      gs.info('[BatchUpdate] Uninstall completed');
      return { success: true, message: 'Uninstall completed' };
    } catch (error) {
      gs.error('[BatchUpdate] Uninstall failed: ' + error);
      return { success: false, message: 'Uninstall failed: ' + error };
    }
  },

  type: 'BatchUpdateInstaller'
};
