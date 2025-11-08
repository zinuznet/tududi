const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const SubtaskTemplateItem = sequelize.define(
        'SubtaskTemplateItem',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            template_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'subtask_templates',
                    key: 'id',
                },
            },
            name: {
                type: DataTypes.STRING(500),
                allowNull: false,
            },
            sort_order: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            tableName: 'subtask_template_items',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );

    SubtaskTemplateItem.associate = (models) => {
        // Item belongs to Template
        SubtaskTemplateItem.belongsTo(models.SubtaskTemplate, {
            foreignKey: 'template_id',
            as: 'Template',
        });
    };

    return SubtaskTemplateItem;
};
