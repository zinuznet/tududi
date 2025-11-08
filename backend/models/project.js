const { DataTypes } = require('sequelize');
const { uid } = require('../utils/uid');

module.exports = (sequelize) => {
    const Project = sequelize.define(
        'Project',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            uid: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                defaultValue: () => uid(),
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            pin_to_sidebar: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            priority: {
                type: DataTypes.INTEGER,
                allowNull: true,
                validate: {
                    min: 0,
                    max: 2,
                },
            },
            due_date_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            area_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'areas',
                    key: 'id',
                },
            },
            image_url: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            task_show_completed: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false,
            },
            task_sort_order: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: 'created_at:desc',
            },
            state: {
                type: DataTypes.ENUM(
                    'idea',
                    'planned',
                    'in_progress',
                    'blocked',
                    'completed'
                ),
                allowNull: false,
                defaultValue: 'idea',
            },
            default_task_hours: {
                type: DataTypes.DECIMAL(5, 2),
                allowNull: true,
                defaultValue: 2.0,
            },
            time_tolerance_percent: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 50,
            },
            hourly_rate: {
                type: DataTypes.DECIMAL(8, 2),
                allowNull: true,
                defaultValue: null,
            },
        },
        {
            tableName: 'projects',
            indexes: [
                {
                    fields: ['user_id'],
                },
                {
                    fields: ['area_id'],
                },
            ],
        }
    );

    return Project;
};
