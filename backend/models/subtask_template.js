const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const SubtaskTemplate = sequelize.define(
        'SubtaskTemplate',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            tableName: 'subtask_templates',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );

    SubtaskTemplate.associate = (models) => {
        // Template belongs to User
        SubtaskTemplate.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'User',
        });

        // Template has many Items
        SubtaskTemplate.hasMany(models.SubtaskTemplateItem, {
            foreignKey: 'template_id',
            as: 'Items',
            onDelete: 'CASCADE',
        });
    };

    return SubtaskTemplate;
};
