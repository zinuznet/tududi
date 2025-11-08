const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const TimeEntry = sequelize.define(
        'TimeEntry',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            task_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'tasks',
                    key: 'id',
                },
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            started_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            stopped_at: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null,
            },
            duration_seconds: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            note: {
                type: DataTypes.TEXT,
                allowNull: true,
                defaultValue: null,
            },
            is_manual: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            tableName: 'time_entries',
            underscored: true,
            indexes: [
                {
                    fields: ['task_id'],
                },
                {
                    fields: ['user_id'],
                },
                {
                    fields: ['started_at'],
                },
                {
                    name: 'idx_time_entries_user_active',
                    fields: ['user_id', 'stopped_at'],
                },
                {
                    name: 'idx_time_entries_task_completed',
                    fields: ['task_id', 'stopped_at'],
                },
            ],
        }
    );

    // Define associations
    TimeEntry.associate = function (models) {
        TimeEntry.belongsTo(models.Task, {
            foreignKey: 'task_id',
            as: 'Task',
        });

        TimeEntry.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'User',
        });
    };

    // Helper method: Check if entry is active (timer running)
    TimeEntry.prototype.isActive = function () {
        return this.stopped_at === null;
    };

    // Helper method: Calculate duration
    TimeEntry.prototype.calculateDuration = function () {
        if (!this.stopped_at) {
            // Timer still running - calculate current duration
            const now = new Date();
            return Math.floor((now - new Date(this.started_at)) / 1000);
        }
        // Timer stopped - return saved duration
        return this.duration_seconds || 0;
    };

    // Helper method: Get duration in hours
    TimeEntry.prototype.getDurationHours = function () {
        return this.calculateDuration() / 3600;
    };

    // Static method: Find active timer for user
    TimeEntry.findActiveTimerForUser = async function (userId) {
        return await this.findOne({
            where: {
                user_id: userId,
                stopped_at: null,
            },
            include: [
                {
                    model: sequelize.models.Task,
                    as: 'Task',
                },
            ],
            order: [['started_at', 'DESC']],
        });
    };

    // Static method: Calculate total actual hours for a task
    TimeEntry.calculateActualHours = async function (taskId) {
        const { Op } = require('sequelize');

        const entries = await this.findAll({
            where: {
                task_id: taskId,
                stopped_at: { [Op.ne]: null }, // Only completed entries
            },
            attributes: ['duration_seconds'],
        });

        const totalSeconds = entries.reduce(
            (sum, entry) => sum + (entry.duration_seconds || 0),
            0
        );

        return totalSeconds / 3600; // Convert to hours
    };

    return TimeEntry;
};
