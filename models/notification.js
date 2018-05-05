var initsql = `

DO $$ 
        BEGIN
            BEGIN
                ALTER TABLE "Notifications" ADD COLUMN "subscribe_user" TEXT[];           
            EXCEPTION
                WHEN duplicate_column THEN RAISE NOTICE 'column "subscribe_user" already exists in Notifications.';
            END;
            BEGIN
                ALTER TABLE "Notifications" ADD COLUMN "subscribe_role" TEXT[];           
            EXCEPTION
                WHEN duplicate_column THEN RAISE NOTICE 'column "subscribe_role" already exists in Notifications.';
            END;
        END;
  $$;  `

module.exports = function (sequelize, DataTypes) {
    var Nofification = sequelize.define("Notification",
        {
            uuid: {type: DataTypes.UUID, allowNull: false, primaryKey: true,defaultValue: DataTypes.UUIDV4},
            user:{type: DataTypes.JSONB},
            action:{type: DataTypes.STRING, allowNull: false},
            old:{type: DataTypes.JSONB},
            new:{type: DataTypes.JSONB},
            update:{type: DataTypes.JSONB},
            type:{type:DataTypes.STRING,allowNull: false},
            notified_user:{type:DataTypes.ARRAY(DataTypes.TEXT),defaultValue:["NONE"]},
            source:{type:DataTypes.STRING,allowNull: false},
            additional:{type: DataTypes.JSONB},
            subscribe_user:{type:DataTypes.ARRAY(DataTypes.TEXT),defaultValue:["ALL"]},
            subscribe_role:{type:DataTypes.ARRAY(DataTypes.TEXT),defaultValue:["ALL"]}
        });
    Nofification.initsql = initsql;
    return Nofification;
};