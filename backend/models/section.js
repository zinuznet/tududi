const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Section = sequelize.define(
        'Section',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            project_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'projects',
                    key: 'id',
                },
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            sort_order: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            collapsed: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            tableName: 'sections',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );

    Section.associate = (models) => {
        // Section belongs to Project
        Section.belongsTo(models.Project, {
            foreignKey: 'project_id',
            as: 'project',
        });

        // Section has many Tasks
        Section.hasMany(models.Task, {
            foreignKey: 'section_id',
            as: 'tasks',
        });
    };

    return Section;
};
