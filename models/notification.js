var initsql = `

DO $$ 
        BEGIN
            BEGIN
                ALTER TABLE "Notifications" ADD COLUMN "source" TEXT;  
                ALTER TABLE "Notifications" ALTER COLUMN notified_user TYPE TEXT[];              
            EXCEPTION
                WHEN duplicate_column THEN RAISE NOTICE 'column "source" already exists in Articles.';
            END;
        END;
  $$;  `

module.exports = function (sequelize, DataTypes) {
    var Nofification = sequelize.define("Notification",
        {
            uuid: {type: DataTypes.UUID, allowNull: false, primaryKey: true,defaultValue: DataTypes.UUIDV4},
            user:{type: DataTypes.JSONB,allowNull: false},
            action:{type: DataTypes.STRING, allowNull: false},
            old:{type: DataTypes.JSONB},
            new:{type: DataTypes.JSONB},
            update:{type: DataTypes.JSONB},
            type:{type:DataTypes.STRING,allowNull: false},
            notified_user:{type:DataTypes.ARRAY(DataTypes.STRING),defaultValue:["NONE"]},
            source:{type:DataTypes.STRING,allowNull: false}
        });
    Nofification.initsql = initsql;
    return Nofification;
};